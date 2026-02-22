import * as fs from "fs";
import * as path from "path";
// import { Component } from "./component.js";
import { Element } from "./element.js";


/**
 * Compiles a raw Element tree into a full HTML file and writes it to disk.
 * Equivalent to compileToHtml() but accepts an Element directly instead of a
 * Component — useful when compiling JSX functional components that return an
 * Element without a surrounding Component.
 *
 * @param element   - The root Element to compile.
 * @param filePath  - Destination file path (e.g. "./output/index.html").
 */
export function compileElementToHtml(element: Element, filePath: string): void {
  const bodyContent = element.toHtmlString(2);
  const clickHandlers = collectClickHandlers(element);
  const scriptBlock = buildOnLoadScript([], clickHandlers);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Compiled Component</title>
  </head>
  <body>
${bodyContent}
${scriptBlock}  </body>
</html>
`;

  const dir = path.dirname(filePath);
  if (dir && dir !== ".") {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`HTML compiled to:      ${path.resolve(filePath)}`);
}

/**
 * Recursively walks the element tree and returns every element that has a
 * click handler registered, along with its unique class name and handler.
 */
function collectClickHandlers(
  el: Element
): Array<{ className: string; handler: () => void }> {
  const results: Array<{ className: string; handler: () => void }> = [];

  const handler = el.getOnClickHandler();
  if (handler !== null) {
    results.push({ className: el.getUniqueClassName(), handler });
  }

  for (const child of el.getChildren()) {
    results.push(...collectClickHandlers(child));
  }

  return results;
}

/**
 * Serializes onLoad hooks and element click handlers into a <script> block
 * that wires everything up inside window.onload.
 * Returns an empty string if there is nothing to emit.
 */
function buildOnLoadScript(
  hooks: Array<() => void>,
  clickHandlers: Array<{ className: string; handler: () => void }>
): string {
  if (hooks.length === 0 && clickHandlers.length === 0) return "";

  const hookLines = hooks.map((fn) => `    (${fn.toString()})();`).join("\n");

  const clickLines = clickHandlers
    .map(
      ({ className, handler }) =>
        `    document.querySelector('.${className}').addEventListener('click', ${handler.toString()});`
    )
    .join("\n");

  const body = [hookLines, clickLines].filter(Boolean).join("\n");

  return `  <script>
  window.onload = function() {
${body}
  };
  </script>\n`;
}
