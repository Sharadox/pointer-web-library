"use client";
import { useEffect, useRef } from "react";
import { clamp } from "@sharadox/web-library/math/clamp";

/**
 * Where the pointer is over an element, eased, for depth that follows it. Sets three unitless CSS variables on the
 * element, each eased towards its target every frame (`ease` is the share of the distance covered per frame):
 * `--parallax-x` and `--parallax-y` (-1 at the left or top edge, 0 in the middle, 1 at the right or bottom edge) and
 * `--parallax-hover` (1 while the pointer is over it, 0 once it has left). All three ease back to 0 when the pointer
 * leaves. Use them with `calc()`, for example
 * `transform: rotateY(calc(var(--parallax-x, 0) * 8deg)) translateX(calc(var(--parallax-x, 0) * 12px))`.
 * Off on touch screens and when less motion is asked for, so the variables stay unset there.
 */
export function useParallax<Target extends HTMLElement>(ease = 0.1) {
  const reference = useRef<Target>(null);
  useEffect(() => {
    const element = reference.current;
    if (!element || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const target = { x: 0, y: 0, hover: 0 };
    const current = { x: 0, y: 0, hover: 0 };
    let frame = 0;
    const step = () => {
      let distance = 0;
      for (const key of ["x", "y", "hover"] as const) {
        current[key] += (target[key] - current[key]) * ease;
        distance += Math.abs(target[key] - current[key]);
      }
      // Close enough: land exactly on the target and stop asking for frames.
      if (distance < 0.001) Object.assign(current, target);
      element.style.setProperty("--parallax-x", current.x.toFixed(4));
      element.style.setProperty("--parallax-y", current.y.toFixed(4));
      element.style.setProperty("--parallax-hover", current.hover.toFixed(4));
      frame = distance < 0.001 ? 0 : requestAnimationFrame(step);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      target.x = clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
      target.y = clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
      target.hover = 1;
      start();
    };
    const leave = () => {
      Object.assign(target, { x: 0, y: 0, hover: 0 });
      start();
    };
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, [ease]);
  return reference;
}
