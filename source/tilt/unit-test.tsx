import { render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useTilt } from "@sharadox/pointer-web-library/tilt";

const finePointer = (fine: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: fine } as MediaQueryList);
function Card({ maximum }: { maximum?: number }) {
  const tilt = useTilt<HTMLDivElement>(maximum);
  return <div ref={tilt} data-testid="card" />;
}
afterEach(() => vi.restoreAllMocks());

test("tilts towards the pointer and back when it leaves", () => {
  finePointer(true);
  const { getByTestId, unmount } = render(<Card maximum={10} />);
  const card = getByTestId("card");
  card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 }) as DOMRect;
  card.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 100, clientY: 0 }));
  expect(card.style.getPropertyValue("--tilt-x")).toBe("10.00deg");
  expect(card.style.getPropertyValue("--tilt-y")).toBe("10.00deg");
  card.dispatchEvent(new Event("pointerleave"));
  expect(card.style.getPropertyValue("--tilt-x")).toBe("0deg");
  unmount();
});

test("stays flat on touch screens", () => {
  finePointer(false);
  const { getByTestId } = render(<Card />);
  const card = getByTestId("card");
  card.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 1, clientY: 1 }));
  expect(card.style.getPropertyValue("--tilt-x")).toBe("");
});
