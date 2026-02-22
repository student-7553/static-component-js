import * as fs from "fs";
import * as path from "path";
import { Component } from "./Component.js";
/**
 * Compiles a root Component into a full HTML file and writes it to disk.
 *
 * @param component  - An instantiated Component whose render tree will be compiled.
 * @param filePath   - Destination file path (e.g. "./output/index.html").
 */
export function compileToHtml(component, filePath) {
    const rootElement = component.getRoot();
    const bodyContent = rootElement.toHtmlString(2);
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Compiled Component</title>
  </head>
  <body>
${bodyContent}
  </body>
</html>
`;
    const dir = path.dirname(filePath);
    if (dir && dir !== ".") {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, html, "utf-8");
    console.log(`Component compiled to: ${path.resolve(filePath)}`);
}
//# sourceMappingURL=compiler.js.map