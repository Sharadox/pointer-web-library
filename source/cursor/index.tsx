"use client";
import { useEffect, useRef } from "react";
import { classNames } from "@sharadox/web-library/class-name";
import styles from "./index.module.css";
import type { CursorProperties } from "@sharadox/pointer-web-library/cursor/type";

/** Where the ring grows by default: anything clickable or typed into. */
export const HOT_ELEMENTS = "a, button, input, textarea, select, label, [data-hot]";
/** Where the ring shows "drag" by default. */
export const GRAB_ELEMENTS = "canvas, [data-grab]";
/** Where the system cursor comes back by default: another site's components shown here, with their own cursors. */
export const NATIVE_ELEMENTS = "[data-guest], [data-native-cursor]";

/**
 * A custom cursor on fine pointers (mice, trackpads): a dot and a ring that follows with a slight lag, grows over
 * clickable elements and turns dashed over draggable ones. White with `mix-blend-mode: difference`, so it shows on
 * any background; restyle it with `--cursor-color`, `--cursor-size` and `className`. Over `nativeSelector` it steps
 * aside and the system cursor shows, with whatever those elements ask for (zoom-in, grab). Touch screens keep their own.
 * It only works while it moves: once the ring has caught up with the pointer it rests until the pointer moves again.
 *
 * @example
 * <Cursor grabSelector="canvas, [data-grab], .gallery" />
 */
export function Cursor({
  hotSelector = HOT_ELEMENTS,
  grabSelector = GRAB_ELEMENTS,
  nativeSelector = NATIVE_ELEMENTS,
  className,
}: CursorProperties) {
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
      if (!frame) frame = requestAnimationFrame(loop);
      const target = event.target as Element;
      root.classList.toggle(styles.native!, !!target.closest?.(nativeSelector));
      ring.current?.classList.toggle(styles.hot!, !!target.closest?.(hotSelector));
      ring.current?.classList.toggle(styles.grab!, !!target.closest?.(grabSelector));
    };
    const loop = () => {
      ringX += (x - ringX) * 0.18;
      ringY += (y - ringY) * 0.18;
      // Within a tenth of a pixel the ring has arrived: it settles exactly there and rests.
      const settled = Math.abs(x - ringX) < 0.1 && Math.abs(y - ringY) < 0.1;
      if (settled) {
        ringX = x;
        ringY = y;
      }
      dot.current!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.current!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = settled ? 0 : requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    frame = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      root.classList.remove(styles.active!, styles.native!);
    };
  }, [hotSelector, grabSelector, nativeSelector]);
  return (
    <>
      <div ref={ring} className={classNames(styles.ring, className)} aria-hidden />
      <div ref={dot} className={classNames(styles.dot, className)} aria-hidden />
    </>
  );
}
