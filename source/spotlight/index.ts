"use client";
import { useEffect, useRef } from "react";

/**
 * Tracks the pointer anywhere on the page as `--pointer-x`/`--pointer-y` relative to an element, for lights that
 * follow the cursor: the light moves even while the pointer is outside the element (it then glows from the edge
 * nearest the pointer), and stays under a still pointer while the page scrolls.
 *
 * @example
 * const spotlight = useSpotlight<HTMLFormElement>();
 * return <form ref={spotlight} className={styles.card}>…</form>;
 */
export function useSpotlight<Target extends HTMLElement>() {
  const reference = useRef<Target>(null);
  useEffect(() => {
    const element = reference.current;
    if (!element) return;
    let pointer: { x: number; y: number } | undefined;
    const place = () => {
      if (!pointer) return;
      const bounds = element.getBoundingClientRect();
      element.style.setProperty("--pointer-x", `${pointer.x - bounds.left}px`);
      element.style.setProperty("--pointer-y", `${pointer.y - bounds.top}px`);
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      place();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", place);
    };
  }, []);
  return reference;
}
