# static-component-js

**static-component-js** is a high-performance, JSX-based frontend framework designed for static-oriented websites that require a bit of interactivity. It is a lightweight alternative to React that eliminates runtime overhead by compiling JSX components directly into static HTML and imperative DOM commands.

## Why static-component-js?

Traditional frontend frameworks (like React) rely on a Virtual DOM (VDOM) and a costly "hydration" process. **static-component-js** takes a different approach, delivering a fully formed interactive website with:

- **🚀 No Hydration**: Unlike VDOM-based frameworks, there is no heavy reconciliation or hydration step. The page is interactive as soon as the minimal script loads.
- **⚡ Lower DOM Overhead**: By compiling JSX to direct DOM manipulation commands (`createElement`, `appendChild`), the framework bypasses the performance tax of VDOM diffing.

## Project Structure

- `src/compiler/`: Framework core and component authoring.
  - `jsx-runtime.ts`: The JSX transform factory.
  - `jsx-compiler.ts`: CLI tool to compile your JSX/TSX site.
  - `compiler.ts`: The build engine that orchestrates HTML and JS generation.
  - `dom-compiler.ts`: The "secret sauce" that compiles JSX trees into optimized JS commands.
  - `html-compiler.ts`: Generates SEO-friendly static HTML.
- `output/`: The fully formed, deployment-ready website.
  - `index.html`: Optimized static entry point.
  - `app.js`: High-performance interactive logic.

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Build Your Site
The framework compiles your JSX components into a static + interactive bundle:
```bash
tsc && node build/compiler/compiler.js {path-to-root-component-folder}
```

### 3. Deploy
Simply serve the `output/` directory. Your site is ready for the world.

## How it Works: The Hybrid Approach

1. **Build Time**: The compiler analyzes your JSX tree and produces two outputs:
   - A static HTML representation for instant first paint.
   - A set of imperative JavaScript commands that mirror the tree structure.
2. **Runtime**: Instead of "hydrating" a VDOM, the framework uses the pre-compiled commands to directly update the real DOM. This "reconstruction" and "update" approach is fundamentally faster than traditional hydration for static-oriented sites.