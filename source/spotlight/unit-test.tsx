import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { useSpotlight } from "@sharadox/pointer-web-library/spotlight";

function Card() {
  const spotlight = useSpotlight<HTMLDivElement>();
  return <div ref={spotlight} data-testid="card" />;
}
function Detached() {
  useSpotlight<HTMLDivElement>();
  return null;
}

const move = (clientX: number, clientY: number) =>
  window.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY }));

test("follows the pointer anywhere on the page, relative to the element, as CSS variables", () => {
  const { getByTestId, unmount } = render(<Card />);
  const card = getByTestId("card");
  let top = 20;
  card.getBoundingClientRect = () => ({ left: 10, top }) as DOMRect;
  move(60, 70);
  expect(card.style.getPropertyValue("--pointer-x")).toBe("50px");
  expect(card.style.getPropertyValue("--pointer-y")).toBe("50px");
  // Outside the element too: the light then sits off its edge, nearest the pointer.
  move(0, 500);
  expect(card.style.getPropertyValue("--pointer-x")).toBe("-10px");
  expect(card.style.getPropertyValue("--pointer-y")).toBe("480px");
  // Scrolling moves the element under a still pointer.
  top = -80;
  window.dispatchEvent(new Event("scroll"));
  expect(card.style.getPropertyValue("--pointer-y")).toBe("580px");
  unmount();
  move(60, 70);
  expect(card.style.getPropertyValue("--pointer-x")).toBe("-10px");
});

test("waits for the pointer before scrolling moves anything", () => {
  const { getByTestId, unmount } = render(<Card />);
  const card = getByTestId("card");
  window.dispatchEvent(new Event("scroll"));
  expect(card.style.getPropertyValue("--pointer-x")).toBe("");
  unmount();
});

test("does nothing until the reference is attached", () => {
  expect(() => render(<Detached />)).not.toThrow();
});
