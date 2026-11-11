# @sharadox/pointer-web-library

Pointer effects for React websites:

- **`useSpotlight`:** the pointer's position inside an element as `--pointer-x` and `--pointer-y`, for lights that follow it.
- **`useTilt(maximum)`:** `--tilt-x` and `--tilt-y` in degrees, for a 3D tilt towards the pointer. It eases back when the pointer leaves, and is off on touch screens.
- **`<Cursor>`:** a dot and a lagging ring. The ring grows over clickable elements and turns dashed over draggable ones. It uses blend mode `difference`, so it shows on any background, and only runs on fine pointers.

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
<Cursor grabSelector="canvas, [data-grab]" />
```

## API

| Import        | Export                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `…/spotlight` | `useSpotlight<T>()` → reference                                                                                                       |
| `…/tilt`      | `useTilt<T>(maximum = 8)` → reference                                                                                                 |
| `…/cursor`    | `<Cursor hotSelector? grabSelector? className?>`, `HOT_ELEMENTS`, `GRAB_ELEMENTS`; CSS variables `--cursor-color` and `--cursor-size` |

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
