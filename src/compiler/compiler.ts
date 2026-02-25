import * as fs from "fs";
import * as path from "path";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify as minifyJs } from "terser";
import { Component } from "./component.js";
import { Element } from "./element.js";
import { toHtmlString } from "./html-compiler.js";
import { compileToDomCommands } from "./dom-compiler.js";
import { runtimeFunctions } from "./html-runtime.js";

/**
 * Compiles an array of components into a full HTML file and writes it to disk.
 *
 * @param components - The components to compile. The first one is the root.
 * @param filePath   - Destination file path (e.g. "./output/index.html").
 */
export async function compileComponentsToHtml(components: Component[], filePath: string, externalScriptUrls: string[] = []): Promise<void> {
    if (components.length === 0) {
        throw new Error("At least one component is required for compilation.");
    }

    const rootComponent = components[0]!;
    const rootElement = rootComponent.getRoot();
    const bodyContent = toHtmlString(rootElement);

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
        allDomScripts.push(`window.components[${idVar}] = function(${params}) {${domCommands}};`);
    }


    const scriptBlock = buildOnLoadScript(allOnLoadHooks, allClickHandlers);
    const domScriptBlock = `  <script> window.components = window.components || {}; ${allDomScripts.join("\n")} </script>`;

    const runtimeBody = runtimeFunctions
        .map(rf => rf.fn.toString())
        .join("");

    const runtimeScript = `<script>${runtimeBody}</script>`;
    const extraScripts = externalScriptUrls.map(url => `<script src="${url}"></script>`).join("");

    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Compiled Component</title>
        </head>
        <body>
        ${bodyContent}
        ${extraScripts}
        ${runtimeScript}
        ${scriptBlock}
        ${domScriptBlock}
        </body>
        </html>`;

    const dir = path.dirname(filePath);
    if (dir && dir !== ".") {
        fs.mkdirSync(dir, { recursive: true });
    }

    const minifiedHtml = await minifyHtml(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
    });

    fs.writeFileSync(filePath, minifiedHtml, "utf-8");
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
        const childElement = child instanceof Component ? child.getRoot() : child;
        results.push(...collectClickHandlers(childElement));
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

/**
 * Extracts parameter names from a function's string representation.
 */
function getParameterNames(fn: Function): string[] {
    const fnStr = fn.toString();
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    return result || [];
}

/**
 * CLI entry-point: compiles one or more JSX/TSX components to HTML + JS output.
 *
 * All source files must be compiled with `npx tsc` first.
 * The first file is the "root" component (used for static HTML).
 * All files have their DOM commands added to index.html.
 *
 * Usage:
 *   node build/jsx-compiler.js <path-to-root.tsx> [other-components.tsx...]
 *
 * Example:
 *   node build/jsx-compiler.js src/examples/App.tsx src/examples/Counter.tsx
 *
 * Outputs:
 *   build/index.html  – Full compiled HTML page
 *   build/app.js      – Copy of the first compiled JS module
 */

let sourceArgs = process.argv.slice(2);

if (sourceArgs.length === 0 || !fs.statSync(sourceArgs[0]!).isDirectory()) {
    console.error("Usage: node build/compiler/compiler.js <folder-path>");
    process.exit(1);
}


const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");



// If the first argument is a directory, expand it and identify external scripts

const folderPath = sourceArgs[0]!;
const filesInFolder = fs.readdirSync(folderPath);

const indexTsx = filesInFolder.find(f => f === "index.tsx");
if (!indexTsx) {
    console.error(`index.tsx not found in folder: ${folderPath}`);
    process.exit(1);
}


const otherTsxFiles = filesInFolder.filter(f => f.endsWith(".tsx") && f !== "index.tsx");

const tsxFileList = [
    path.join(folderPath, indexTsx),
    ...otherTsxFiles.map(f => path.join(folderPath, f)),
];


const components: Component[] = [];
/** Maps each TSX file's basename (without extension) to its default-export function. */
const tsxFunctionMap = new Map<string, (...args: string[]) => Element | Component>();

for (const tsxFile of tsxFileList) {
    const srcPath = path.resolve(tsxFile);
    const relativeSrc = path.relative(srcDir, srcPath);
    const jsRelPath = relativeSrc.replace(/\.tsx?$/, ".js");
    const jsAbsPath = path.join(projectRoot, "build", jsRelPath);

    if (!fs.existsSync(jsAbsPath)) {
        console.error(`Compiled JS not found at: ${jsAbsPath}`);
        console.error("Run  npx tsc  first, then retry.");
        process.exit(1);
    }

    const mod = await import(jsAbsPath) as { default?: unknown };

    const DefaultExport = mod.default;
    if (typeof DefaultExport !== "function") {
        console.error(`Module ${tsxFile} has no callable default export.`);
        process.exit(1);
    }

    const parameterNames = getParameterNames(DefaultExport as Function);
    const placeholders = parameterNames.map(p => `$${p}`);
    const componentFunction = DefaultExport as (...args: string[]) => Element | Component;

    // Store the function in the map keyed by TSX filename (e.g. "Card1", "index")
    const fileKey = path.basename(tsxFile, path.extname(tsxFile));
    tsxFunctionMap.set(fileKey, componentFunction);

    const result = componentFunction(...placeholders);

    let element: Element;
    if (result instanceof Component) {
        element = result.getRoot();
    } else if (result instanceof Element) {
        element = result;
    } else {
        console.error(`Default export of ${tsxFile} did not return an Element or Component instance.`);
        process.exit(1);
    }

    const uniqueId = path.basename(tsxFile, path.extname(tsxFile));
    components.push(new Component(element, uniqueId, fileKey, parameterNames));

}

// Now process external scripts (strip exports, minify) and collect URLs

const otherTsFiles = filesInFolder.filter(f => f.endsWith(".ts"));
const externalScriptProcessing: Array<{ absPath: string; relPath: string }> = [];

for (const tsFile of otherTsFiles) {
    const tsPath = path.join(folderPath, tsFile);
    const relativeTs = path.relative(srcDir, tsPath);
    const jsRelPath = relativeTs.replace(/\.ts$/, ".js");
    const jsAbsPath = path.join(projectRoot, "build", jsRelPath);
    externalScriptProcessing.push({ absPath: jsAbsPath, relPath: jsRelPath });
}

let externalScriptUrls: string[] = [];

for (const { absPath, relPath } of externalScriptProcessing) {
    if (!fs.existsSync(absPath)) {
        console.warn(`Compiled JS not found at: ${absPath}`);
        continue;
    }

    let jsContent = fs.readFileSync(absPath, "utf-8");
    jsContent = jsContent.replace(/^export\s+/gm, "");

    const minifyResult = await minifyJs(jsContent, { compress: true, mangle: true });
    const minifiedJs = minifyResult.code ?? jsContent;

    const finalJsAbsPath = path.join(projectRoot, "output", relPath);
    const finalJsDir = path.dirname(finalJsAbsPath);
    if (!fs.existsSync(finalJsDir)) {
        fs.mkdirSync(finalJsDir, { recursive: true });
    }

    fs.writeFileSync(finalJsAbsPath, minifiedJs, "utf-8");
    console.log(`JS (minified) written to: ${finalJsAbsPath}`);
    externalScriptUrls.push("./" + relPath);
}

// ── Produce HTML ─────────────────────────────────────────────────────────────
const htmlOutPath = path.join(projectRoot, "output", "index.html");
compileComponentsToHtml(components, htmlOutPath, externalScriptUrls);

