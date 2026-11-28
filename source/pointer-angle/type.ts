/** How an element follows the pointer's direction. */
export interface PointerAngleOptions {
  /** How near the pointer must come to the element's edges, in pixels, before the angle follows it. */
  range: number;
  /** The angle in degrees while the pointer is away (0 to the right, 90 below, -90 above, 180 to the left). */
  rest: number;
  /** Receives each new angle in degrees. */
  onAngle: (angle: number) => void;
}
