import { render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useParallax } from "@sharadox/pointer-web-library/parallax";

function media({ fine = true, reduce = false }) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) => ({ matches: query.includes("reduce") ? reduce : fine }) as MediaQueryList,
  );
}
/** Runs every requested frame right away, as many as the hook asks for. */
function instantFrames() {
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  return () => {
    while (frames.length) frames.shift()!(0);
  };
}
function Scene({ ease }: { ease?: number }) {
  const scene = useParallax<HTMLDivElement>(ease);
  return <div ref={scene} data-testid="scene" />;
}
afterEach(() => vi.restoreAllMocks());

test("eases towards the pointer, then back to the middle when it leaves", () => {
  media({});
  const flush = instantFrames();
  const { getByTestId, unmount } = render(<Scene ease={0.5} />);
  const scene = getByTestId("scene");
  scene.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
  scene.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 200, clientY: 25 }));
  scene.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 400, clientY: 25 }));
  flush();
  expect(scene.style.getPropertyValue("--parallax-x")).toBe("1.0000");
  expect(scene.style.getPropertyValue("--parallax-y")).toBe("-0.5000");
  expect(scene.style.getPropertyValue("--parallax-hover")).toBe("1.0000");
  scene.dispatchEvent(new Event("pointerleave"));
  flush();
  expect(scene.style.getPropertyValue("--parallax-x")).toBe("0.0000");
  expect(scene.style.getPropertyValue("--parallax-hover")).toBe("0.0000");
  unmount();
});

test("moves part of the way each frame", () => {
  media({});
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
  const { getByTestId } = render(<Scene />);
  const scene = getByTestId("scene");
  scene.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
  scene.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 100, clientY: 50 }));
  frames.shift()!(0);
  expect(scene.style.getPropertyValue("--parallax-x")).toBe("0.1000");
  expect(frames).toHaveLength(1);
});

test("stays still on touch screens and when less motion is asked for", () => {
  for (const choice of [{ fine: false }, { reduce: true }]) {
    media(choice);
    const { getAllByTestId } = render(<Scene />);
    const scene = getAllByTestId("scene").at(-1)!;
    scene.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 1, clientY: 1 }));
    expect(scene.style.getPropertyValue("--parallax-x")).toBe("");
  }
});
