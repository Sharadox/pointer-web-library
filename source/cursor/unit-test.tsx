import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Cursor } from "@sharadox/pointer-web-library/cursor";

const finePointer = (fine: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: fine } as MediaQueryList);
const move = (target: Element, clientX: number, clientY: number) =>
  target.dispatchEvent(Object.assign(new Event("pointermove", { bubbles: true }), { clientX, clientY }));

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Cursor", () => {
  test("follows the pointer and reacts to clickable and draggable elements", () => {
    finePointer(true);
    document.body.innerHTML = '<a href="#">link</a><canvas></canvas><p>text</p>';
    const { container, unmount } = render(<Cursor className="brand" />);
    const [ring, dot] = container.children as unknown as HTMLElement[];
    expect(document.documentElement.className).toBe("active");
    move(document.querySelector("a")!, 100, 50);
    vi.advanceTimersByTime(20);
    expect(dot!.style.transform).toBe("translate3d(100px, 50px, 0)");
    expect(ring!.className).toContain("hot");
    expect(ring!.className).toContain("brand");
    move(document.querySelector("canvas")!, 10, 10);
    expect(ring!.className).toContain("grab");
    move(document.querySelector("p")!, 10, 10);
    expect(ring!.className).not.toContain("grab");
    unmount();
    expect(document.documentElement.className).toBe("");
  });

  test("leaves touch screens alone", () => {
    finePointer(false);
    render(<Cursor />);
    expect(document.documentElement.className).toBe("");
  });

  test("copes with pointer events on targets without closest()", () => {
    finePointer(true);
    const { container, unmount } = render(<Cursor hotSelector="button" grabSelector=".drag" />);
    window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 1, clientY: 1 }));
    expect((container.children[0] as HTMLElement).className).not.toContain("hot");
    unmount();
  });
});
