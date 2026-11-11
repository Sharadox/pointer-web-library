"use client";
import { useEffect, useRef } from "react";
import { classNames } from "@sharadox/web-library/class-name";
import styles from "./index.module.css";
import type { CursorProperties } from "@sharadox/pointer-web-library/cursor/type";

/** Where the ring grows by default: anything clickable or typed into. */
export const HOT_ELEMENTS = "a, button, input, textarea, select, label, [data-hot]";
/** Where the ring shows "drag" by default. */
export const GRAB_ELEMENTS = "canvas, [data-grab]";

/**
 * A custom cursor on fine pointers (mice, trackpads): a dot and a ring that follows with a slight lag, grows over
 * clickable elements and turns dashed over draggable ones. White with `mix-blend-mode: difference`, so it shows on
 * any background; restyle it with `--cursor-color`, `--cursor-size` and `className`. Touch screens keep their own.
 *
 * @example
 * <Cursor grabSelector="canvas, [data-grab], .gallery" />
 */
export function Cursor({ hotSelector = HOT_ELEMENTS, grabSelector = GRAB_ELEMENTS, className }: CursorProperties) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add(styles.active!);
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let frame = 0;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const target = event.target as Element;
      ring.current?.classList.toggle(styles.hot!, !!target.closest?.(hotSelector));
      ring.current?.classList.toggle(styles.grab!, !!target.closest?.(grabSelector));
    };
    const loop = () => {
      ringX += (x - ringX) * 0.18;
      ringY += (y - ringY) * 0.18;
      dot.current!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.current!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      root.classList.remove(styles.active!);
    };
  }, [hotSelector, grabSelector]);
  return (
    <>
      <div ref={ring} className={classNames(styles.ring, className)} aria-hidden />
      <div ref={dot} className={classNames(styles.dot, className)} aria-hidden />
    </>
  );
}
