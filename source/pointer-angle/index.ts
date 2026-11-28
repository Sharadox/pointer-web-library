import type { PointerAngleOptions } from "@sharadox/pointer-web-library/pointer-angle/type";

interface Followed {
  element: Element;
  options: PointerAngleOptions;
  /** On screen (or near it): only these are measured. */
  visible: boolean;
  /** The last angle given, unwrapped so it never jumps a whole turn. */
  angle: number;
  near: boolean;
}

const followed = new Set<Followed>();
let pointer: { x: number; y: number } | undefined;
let frame: number | undefined;
let observer: IntersectionObserver | undefined;

/** The angle equal to `to` nearest to `from`, so turning takes the shortest way. */
const nearest = (from: number, to: number) => from + ((((to - from) % 360) + 540) % 360) - 180;

/** Measures every element on screen once (all reads first), then gives each its angle. */
function update() {
  frame = undefined;
  const measured = [...followed]
    .filter((entry) => entry.visible && (pointer || entry.near))
    .map((entry) => [entry, entry.element.getBoundingClientRect()] as const);
  for (const [entry, bounds] of measured) {
    const near =
      pointer !== undefined &&
      Math.hypot(
        Math.max(bounds.left - pointer.x, 0, pointer.x - bounds.right),
        Math.max(bounds.top - pointer.y, 0, pointer.y - bounds.bottom),
      ) <= entry.options.range;
    if (!near && !entry.near) continue;
    entry.near = near;
    const target = near
      ? (Math.atan2(pointer!.y - (bounds.top + bounds.height / 2), pointer!.x - (bounds.left + bounds.width / 2)) *
          180) /
        Math.PI
      : entry.options.rest;
    entry.angle = nearest(entry.angle, target);
    entry.options.onAngle(entry.angle);
  }
}
const schedule = () => {
  frame ??= requestAnimationFrame(update);
};
const move = (event: PointerEvent) => {
  pointer = { x: event.clientX, y: event.clientY };
  schedule();
};
const leave = () => {
  pointer = undefined;
  schedule();
};
/** A finger lifted leaves; a mouse button let go doesn't. */
const lift = (event: PointerEvent) => {
  if (event.pointerType !== "mouse") leave();
};
const seen = (entries: IntersectionObserverEntry[]) => {
  for (const { target, isIntersecting } of entries)
    for (const entry of followed) if (entry.element === target) entry.visible = isIntersecting;
  schedule();
};

/**
 * Follows the pointer's direction from an element's center while the pointer is within `range` pixels of its edges,
 * calling `onAngle` with the angle in degrees (0 to the right, 90 below), and back to `rest` once it leaves (the page
 * too, or a finger lifted). The angle turns the shortest way and never jumps a whole turn, so a CSS transition on it
 * stays smooth. Every followed element shares one set of listeners and one measure per animation frame, and elements
 * off screen cost nothing. Returns the function that stops following.
 *
 * @example
 * const stop = followPointerAngle(card, { range: 128, rest: 90, onAngle: (angle) => glow.style.setProperty("--glow-angle", `${angle}deg`) });
 */
export function followPointerAngle(element: Element, options: PointerAngleOptions): () => void {
  if (followed.size === 0) {
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", lift, { passive: true });
    window.addEventListener("pointercancel", lift, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", leave);
  }
  const entry: Followed = { element, options, visible: false, angle: options.rest, near: false };
  followed.add(entry);
  if (typeof IntersectionObserver === "undefined") entry.visible = true;
  else (observer ??= new IntersectionObserver(seen)).observe(element);
  return () => {
    followed.delete(entry);
    observer?.unobserve(element);
    if (followed.size > 0) return;
    observer?.disconnect();
    observer = undefined;
    pointer = undefined;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", lift);
    window.removeEventListener("pointercancel", lift);
    window.removeEventListener("scroll", schedule, { capture: true });
    document.documentElement.removeEventListener("pointerleave", leave);
  };
}
