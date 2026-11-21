# static-component-js

**static-component-js** is a high-performance, JSX-based frontend framework designed for static-oriented websites that require a bit of interactivity. It is a lightweight alternative to React that eliminates runtime overhead by compiling JSX components directly into static HTML and imperative DOM commands.

## Why static-component-js?

Traditional frontend frameworks (like React) rely on a Virtual DOM (VDOM) and a costly "hydration" process. **static-component-js** takes a different approach, delivering a fully formed interactive website with:

- **🚀 No Hydration**: Unlike VDOM-based frameworks, there is no heavy reconciliation or hydration step. The page is interactive as soon as the minimal script loads.
- **⚡ Lower DOM Overhead**: By compiling JSX to direct DOM manipulation commands (`createElement`, `appendChild`), the framework bypasses the performance tax of VDOM diffing.
