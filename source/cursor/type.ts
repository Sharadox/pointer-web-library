export interface CursorProperties {
  /** Elements that make the ring grow (links, buttons, fields…). */
  hotSelector?: string;
  /** Elements that show the "drag" ring (canvases, draggable strips…). */
  grabSelector?: string;
  /** Extra class for the dot and the ring, to restyle them. */
  className?: string;
}
