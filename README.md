# @sharadox/pointer-web-library

Pointer effects for React websites:

- **`useSpotlight`:** the pointer's position relative to an element as `--pointer-x` and `--pointer-y`, for lights that follow it: anywhere on the page, so the light moves before the pointer reaches the element, and while the page scrolls.
- **`useTilt(maximum)`:** `--tilt-x` and `--tilt-y` in degrees, for a 3D tilt towards the pointer. It eases back when the pointer leaves, and is off on touch screens.
- **`useParallax(ease)`:** where the pointer is over an element as `--parallax-x` and `--parallax-y` (-1 to 1) and `--parallax-hover` (0 to 1), eased every frame and back to 0 when it leaves, for scenes with depth. It is off on touch screens and with reduced motion.
- **`<Cursor>`:** a dot and a lagging ring. The ring grows over clickable elements and turns dashed over draggable ones. Over native zones (`[data-guest]`: another site's components shown on yours) it steps aside and the system cursor shows. It uses blend mode `difference`, so it shows on any background, and only runs on fine pointers.

## Install

```sh
pnpm add @sharadox/pointer-web-library
```

## Use

```tsx
const card = useSpotlight<HTMLElement>();
<article ref={card} className={styles.card} />;
// .card::before { background: radial-gradient(400px circle at var(--pointer-x) var(--pointer-y), …) }
```

```tsx
const stage = useTilt<HTMLDivElement>(6);
// .stage { transform: perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) }
```

```tsx
const scene = useParallax<HTMLDivElement>(0.08);
// .phone { transform: translate3d(calc(var(--parallax-x, 0) * 14px), calc(var(--parallax-y, 0) * 10px), 60px) }
```

```tsx
<Cursor grabSelector="canvas, [data-grab]" />
```

## API

| Import        | Export                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `…/spotlight` | `useSpotlight<T>()` → reference                                                                                                                                          |
| `…/tilt`      | `useTilt<T>(maximum = 8)` → reference                                                                                                                                    |
| `…/parallax`  | `useParallax<T>(ease = 0.1)` → reference; CSS variables `--parallax-x`, `--parallax-y`, `--parallax-hover`                                                               |
| `…/cursor`    | `<Cursor hotSelector? grabSelector? nativeSelector? className?>`, `HOT_ELEMENTS`, `GRAB_ELEMENTS`, `NATIVE_ELEMENTS`; CSS variables `--cursor-color` and `--cursor-size` |

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
