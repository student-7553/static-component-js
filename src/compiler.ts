import * as fs from "fs";
import * as path from "path";
import { Component } from "./component.js";
import { Element } from "./element.js";
import { toHtmlString } from "./html-compiler.js";
import { compileToDomCommands } from "./dom-compiler.js";
import { renderComponent, removeComponent } from "./html-runtime.js";


/**
 * Compiles an array of Components into a full HTML file and writes it to disk.
 *
 * @param components - The Components to compile. The first one is the root.
 * @param filePath   - Destination file path (e.g. "./output/index.html").
 */
export function compileComponentsToHtml(components: Component[], filePath: string): void {
  if (components.length === 0) {
    throw new Error("At least one component is required for compilation.");
  }

  const rootComponent = components[0]!;
  const rootElement = rootComponent.getRoot();
  const bodyContent = toHtmlString(rootElement, 2);

  const allOnLoadHooks: Array<() => void> = [];
  const allClickHandlers: Array<{ className: string; handler: () => void }> = [];
  const allDomScripts: string[] = [];

  for (const component of components) {
    const element = component.getRoot();
    allOnLoadHooks.push(...component.getOnLoadHooks());
    allClickHandlers.push(...collectClickHandlers(element));

    const domCommands = compileToDomCommands(element);
    const idVar = component.uniqueId ? `'${component.uniqueId}'` : `'default'`;
    const params = component.parameters.join(", ");
    allDomScripts.push(`    window.Components[${idVar}] = function(${params}) {
${domCommands}
    };`);
  }

  const runtimeFunctions = [
    { name: "renderComponent", fn: renderComponent },
    { name: "removeComponent", fn: removeComponent },
  ];

  const scriptBlock = buildOnLoadScript(allOnLoadHooks, allClickHandlers);
  const domScriptBlock = `  <script>
    window.Components = window.Components || {};
${allDomScripts.join("\n")}
  </script>`;

  const runtimeBody = runtimeFunctions
    .map(rf => rf.fn.toString())
    .join("\n\n");
  const runtimeScript = `  <script>\n${runtimeBody}\n  </script>`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Compiled Component</title>
  </head>
  <body>
${bodyContent}
${runtimeScript}
${scriptBlock}
${domScriptBlock}
  </body>
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
