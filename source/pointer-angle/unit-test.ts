import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { followPointerAngle } from "@sharadox/pointer-web-library/pointer-angle";

let visibility: ((entries: { target: Element; isIntersecting: boolean }[]) => void) | undefined;
const observed = new Set<Element>();
let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof visibility) {
        visibility = callback;
      }
      observe(target: Element) {
        observed.add(target);
      }
      unobserve(target: Element) {
        observed.delete(target);
      }
      disconnect() {
        observed.clear();
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

const frame = () => frames.splice(0).forEach((callback) => callback(0));
const move = (clientX: number, clientY: number, pointerType = "mouse") =>
  window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY, pointerType }));
/** A 100 × 40 element whose center is at (150, 120). */
const element = () => {
  const target = document.createElement("div");
  target.getBoundingClientRect = () =>
    ({ left: 100, right: 200, top: 100, bottom: 140, width: 100, height: 40 }) as DOMRect;
  return target;
};
const seen = (target: Element) => visibility!([{ target, isIntersecting: true }]);

test("turns toward the pointer while it is near, by the shortest way, and back to rest when it leaves", () => {
  const target = element();
  const angles: number[] = [];
  const stop = followPointerAngle(target, { range: 50, rest: 90, onAngle: (angle) => angles.push(angle) });
  seen(target);
  // Far away: nothing to do.
  move(150, 400);
  frame();
  expect(angles).toEqual([]);
  // Right of it (within 50 px of its edge): 0°; then above: -90°.
  move(240, 120);
  frame();
  move(150, 60);
  frame();
  // Then left: from -90° the shortest way is to -180°, not +180°.
  move(60, 120);
  frame();
  // Then below: 90° is -270° from -180°, so it keeps turning the same way.
  move(150, 180);
  frame();
  expect(angles).toEqual([0, -90, -180, -270]);
  // Leaving: back to rest (90°) by the nearest equal angle (-270°), once.
  move(150, 400);
  frame();
  move(150, 500);
  frame();
  expect(angles).toEqual([0, -90, -180, -270, -270]);
  stop();
  expect(observed.size).toBe(0);
});

test("does nothing while the element is off screen, and measures once a frame however many moves", () => {
  const target = element();
  const measure = vi.spyOn(target, "getBoundingClientRect");
  const onAngle = vi.fn();
  const stop = followPointerAngle(target, { range: 50, rest: 90, onAngle });
  move(240, 120);
  frame();
  expect(onAngle).not.toHaveBeenCalled();
  expect(measure).not.toHaveBeenCalled();
  seen(target);
  move(240, 120);
  move(241, 120);
  move(242, 120);
  frame();
  expect(measure).toHaveBeenCalledTimes(1);
  expect(onAngle).toHaveBeenCalledTimes(1);
  visibility!([{ target, isIntersecting: false }]);
  move(150, 60);
  frame();
  expect(onAngle).toHaveBeenCalledTimes(1);
  stop();
});

test("a scroll measures again under a still pointer; a scroll before any move does nothing", () => {
  const target = element();
  const onAngle = vi.fn();
  const stop = followPointerAngle(target, { range: 100, rest: 90, onAngle });
  seen(target);
  window.dispatchEvent(new Event("scroll"));
  frame();
  expect(onAngle).not.toHaveBeenCalled();
  move(240, 120);
  frame();
  target.getBoundingClientRect = () =>
    ({ left: 100, right: 200, top: -10, bottom: 70, width: 100, height: 80 }) as DOMRect;
  window.dispatchEvent(new Event("scroll"));
  frame();
  expect(onAngle).toHaveBeenLastCalledWith(45);
  stop();
});

test("a pointer leaving the page, or a finger lifted, sends it back to rest", () => {
  const target = element();
  const onAngle = vi.fn();
  const stop = followPointerAngle(target, { range: 50, rest: 90, onAngle });
  seen(target);
  move(240, 120);
  frame();
  document.documentElement.dispatchEvent(new Event("pointerleave"));
  frame();
  expect(onAngle).toHaveBeenLastCalledWith(90);
  move(240, 120, "touch");
  frame();
  window.dispatchEvent(Object.assign(new Event("pointerup"), { pointerType: "touch" }));
  frame();
  expect(onAngle).toHaveBeenLastCalledWith(90);
  // A mouse button let go changes nothing.
  move(240, 120);
  frame();
  window.dispatchEvent(Object.assign(new Event("pointerup"), { pointerType: "mouse" }));
  frame();
  expect(onAngle).toHaveBeenLastCalledWith(0);
  stop();
});

test("follows several elements with one set of listeners, removed with the last", () => {
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  const shown = element();
  const hidden = vi.fn();
  const first = followPointerAngle(shown, { range: 50, rest: 90, onAngle: () => {} });
  const second = followPointerAngle(element(), { range: 50, rest: 90, onAngle: hidden });
  // Only the element seen is measured.
  seen(shown);
  move(240, 120);
  frame();
  expect(hidden).not.toHaveBeenCalled();
  const added = add.mock.calls.filter(([type]) => type === "pointermove").length;
  expect(added).toBe(1);
  first();
  expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBe(0);
  second();
  expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBe(1);
});

test("without IntersectionObserver every element counts as seen", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const onAngle = vi.fn();
  const stop = followPointerAngle(element(), { range: 50, rest: 90, onAngle });
  move(240, 120);
  frame();
  expect(onAngle).toHaveBeenCalledWith(0);
  stop();
});
