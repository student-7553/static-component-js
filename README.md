# static-component-js

**static-component-js** is a high-performance, JSX-based frontend framework designed for static-oriented websites that require a bit of interactivity. It is a lightweight alternative to React that eliminates runtime overhead by compiling JSX components directly into static HTML and imperative DOM commands.

## Why static-component-js?

Traditional frontend frameworks (like React) rely on a Virtual DOM (VDOM) and a costly "hydration" process. **static-component-js** takes a different approach, delivering a fully formed interactive website with:

- **🚀 No Hydration**: Unlike VDOM-based frameworks, there is no heavy reconciliation or hydration step. The page is interactive as soon as the minimal script loads.
- **⚡ Lower DOM Overhead**: By compiling JSX to direct DOM manipulation commands (`createElement`, `appendChild`), the framework bypasses the performance tax of VDOM diffing.

## Project Structure

- `src/compiler/`: Framework core.
  - `jsx-runtime.ts`: The JSX transform factory.
  - `jsx-compiler.ts`: CLI tool to compile your JSX/TSX site.
  - `compiler.ts`: The build engine that orchestrates HTML and JS generation.
  - `dom-compiler.ts`: The "secret sauce" that compiles JSX trees into optimized JS commands.
  - `html-compiler.ts`: Generates SEO-friendly static HTML.
- `output/`: The fully formed, deployment-ready website.
  - `index.html`: Optimized static entry point.

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
Simply serve the `output/` directory.

## How it Works:

1. **Build Time**: The compiler analyzes your JSX tree and produces two outputs:
   - A static HTML representation for instant first paint.
   - A set of imperative JavaScript commands that mirror the tree structure.
2. **Runtime**: Instead of "hydrating" a VDOM, the framework uses the pre-compiled commands to directly update the real DOM. This "reconstruction" and "update" approach is fundamentally faster than traditional hydration for static-oriented sites.

## Specifically:

When you build your application using our compiler, we look at your components and generate imperative JavaScript functions that build the DOM node-by-node.

For example, a component like this:

```tsx
export default function Entry(
  id: number,
  title: string,
  type: string,
) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <p>{id}</p>
      <p>{title}</p>
      <p>{type}</p>
    </div>
  );
}
```

Is compiled into a highly-efficient DOM construction function:

```javascript
window.components['Entry'] = function($id, $title, $type) {
  const el1 = document.createElement("div");
  el1.style.cssText = "display:flex;gap:10px";
  
  const el2 = document.createElement("p");
  el2.textContent = id;
  el1.appendChild(el2);
  
  const el3 = document.createElement("p");
  el3.textContent = title;
  el1.appendChild(el3);
  
  const el4 = document.createElement("p");
  el4.textContent = type;
  el1.appendChild(el4);
  
  return el1;
};
```

You can then mount these components at runtime using the included runtime helpers:

```javascript
// Creates the element and appends it to a parent container
window.inner.renderComponent("Entry", "containerId", [123, "My Post", "story"]);

// Or just create the DOM node and handle it yourself
const newElement = window.inner.createComponent("Entry", [123, "My Post", "story"]);
containerElement.append(newElement);
```

## Trade offs:

While **static-component-js** offers unparalleled speed and zero hydration overhead, it makes a specific set of trade-offs:

1. **Manual State Management**: Unlike React, there is no built-in reactivity system. If your data changes, the framework will not automatically figure out what parts of the DOM need to change. You must manually update these elements, or completely re-render them.
