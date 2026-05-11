# IDK

A small Bun and TypeScript project built as a testbed for two ideas:

1. serving a simple Express.js app
2. bundling HTML, CSS, and JavaScript into a single inlined HTML file

The original goal was to experiment with a basic static-file builder. To make the output easy to test, the project grew into a small browser game powered by a lightweight custom game engine. It is intentionally simple and is meant as a practical playground rather than a full product.

## What it does

- Builds a single self-contained HTML file from separate source files
- Serves the generated page with Bun and Express
- Runs a small canvas-based game where the player moves a paddle to catch falling flakes
- Shows a score counter and uses a custom game loop for input, updates, and drawing

## How it is structured

- `src/app.ts` starts the web server and serves the generated page
- `src/build-inline.ts` assembles the HTML, CSS, and JavaScript into `public/index.inline.html`
- `src/core/engine.js` contains the small game engine
- `src/scripts/client.js` contains the game logic
- `src/styles/` and `src/views/` contain the source assets used by the builder

## Requirements

- Bun

## Install

```bash
bun install
```

## Build

```bash
bun run src/build-inline.ts
```

This generates `public/index.inline.html` from the source files.

## Run

```bash
bun run src/app.ts
```

Open the server in your browser after it starts.

## Notes

- The project is intentionally small and experimental.
- The builder is focused on simple local workflows rather than a general-purpose packaging system.
- The game exists mainly as a test case for the builder and rendering loop.
