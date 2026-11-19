export interface CursorProperties {
  /** Elements that make the ring grow (links, buttons, fields…). */
  hotSelector?: string;
  /** Elements that show the "drag" ring (canvases, draggable strips…). */
  grabSelector?: string;
  /** Where the system cursor shows instead (another site's components, with cursors of their own). */
  nativeSelector?: string;
  /** Extra class for the dot and the ring, to restyle them. */
  className?: string;
}
