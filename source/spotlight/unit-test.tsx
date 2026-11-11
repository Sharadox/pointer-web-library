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

test("tracks the pointer inside the element as CSS variables", () => {
  const { getByTestId, unmount } = render(<Card />);
  const card = getByTestId("card");
  card.getBoundingClientRect = () => ({ left: 10, top: 20 }) as DOMRect;
  card.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: 60, clientY: 70 }));
  expect(card.style.getPropertyValue("--pointer-x")).toBe("50px");
  expect(card.style.getPropertyValue("--pointer-y")).toBe("50px");
  unmount();
});

test("does nothing until the reference is attached", () => {
  expect(() => render(<Detached />)).not.toThrow();
});
