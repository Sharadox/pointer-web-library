"use client";
import { useEffect, useRef } from "react";

/** Tracks the pointer inside an element as `--pointer-x`/`--pointer-y`, for lights that follow the cursor. */
export function useSpotlight<Target extends HTMLElement>() {
  const reference = useRef<Target>(null);
  useEffect(() => {
    const element = reference.current;
    if (!element) return;
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      element.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    };
    element.addEventListener("pointermove", move);
    return () => element.removeEventListener("pointermove", move);
  }, []);
  return reference;
}
