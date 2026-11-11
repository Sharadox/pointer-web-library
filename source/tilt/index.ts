"use client";
import { useEffect, useRef } from "react";

/**
 * Tilts an element towards the pointer: sets `--tilt-x` and `--tilt-y` (degrees, up to `maximum`) while the pointer
 * is over it and eases back to 0 when it leaves. Use them in CSS, for example
 * `transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))`. Off on touch screens.
 */
export function useTilt<Target extends HTMLElement>(maximum = 8) {
  const reference = useRef<Target>(null);
  useEffect(() => {
    const element = reference.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      element.style.setProperty("--tilt-x", `${(-y * maximum * 2).toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${(x * maximum * 2).toFixed(2)}deg`);
    };
    const leave = () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
    };
  }, [maximum]);
  return reference;
}
