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
export async function compileComponentsToHtml(components: Component[], filePath: string, externalScriptUrls: string[] = [], cssBlock: string = "", domCommandFileNames: string[] = []): Promise<void> {
    if (components.length === 0) {
        throw new Error("At least one component is required for compilation.");
    }

    const rootComponent = components[0]!;
    const rootElement = rootComponent.getRoot();
    const bodyContent = toHtmlString(rootElement);

    const domScriptBlock = domCommandFileNames.map(fileName => `<script async src="./${fileName}"></script>`).join("");

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
            <style>
        ${cssBlock}
            </style>
        </head>
        <body>
        ${bodyContent}
        ${extraScripts}
        ${runtimeScript}
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
 * Extracts parameter names from a function's string representation.
 */
function getParameterNames(fn: Function): string[] {
    const fnStr = fn.toString();
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    return result || [];
}


async function writeScriptBlock(externalScriptProcessing: Array<{ absPath: string; relPath: string }>) {
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

    return externalScriptUrls;
}

async function getCSSBlock(cssScriptProcessing: Array<{ absPath: string }>) {
    let allGeneratedCss = "";
    for (const { absPath } of cssScriptProcessing) {
        if (!fs.existsSync(absPath)) {
            console.warn(`Compiled JS not found for CSS script at: ${absPath}`);
            continue;
        }

        // Import the compiled JS file
        const mod = await import(absPath) as { default?: unknown };
        const DefaultExport = mod.default;

        const styleObj: Record<string, unknown> = typeof DefaultExport === "function" ? DefaultExport() : DefaultExport;
        if (styleObj !== null) {
            for (const [selector, rules] of Object.entries(styleObj)) {
                allGeneratedCss += `${selector} {\n`;
                for (const [prop, val] of Object.entries(rules as Record<string, string>)) {
                    allGeneratedCss += `  ${prop}: ${val};\n`;
                }
                allGeneratedCss += "}\n";
            }
        }
    }
    return allGeneratedCss;
}

async function writeDomCommands(components: Component[], filePath: string) {
    let domCommandFileNames = [];
    let index = 0;
    for (const component of components) {
        const element = component.getRoot();
        const domCommands = compileToDomCommands(element);
        const idVar = component.uniqueId ? `'${component.uniqueId}'` : `'default'`;
        const params = component.parameters.join(", ");

        const domScript = `window.components = window.components || {};window.components[${idVar}] = function(${params}) {${domCommands}};`;
        const minifiedDomJs = (await minifyJs(domScript, { compress: true, mangle: true })).code ?? domScript;
        let fileName = `dom-commands-${index}.js`;
        domCommandFileNames.push(fileName);
        const domOutPath = path.join(path.dirname(filePath), fileName);
        fs.writeFileSync(domOutPath, minifiedDomJs, "utf-8");
        index++;
    }

    return domCommandFileNames;
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



const folderPath = sourceArgs[0]!;

/** Recursively collects all files with the given extensions under `dir`. */
function collectFilesRecursive(dir: string, extensions: string[]): string[] {
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...collectFilesRecursive(fullPath, extensions));
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

const allTsxFiles = collectFilesRecursive(folderPath, [".tsx"]);

const indexTsx = allTsxFiles.find(f => path.basename(f) === "index.tsx");
if (!indexTsx) {
    console.error(`index.tsx not found in folder: ${folderPath}`);
    process.exit(1);
}

const otherTsxFiles = allTsxFiles.filter(f => f !== indexTsx);

const tsxFileList = [
    indexTsx,
    ...otherTsxFiles,
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

const allTsFiles = collectFilesRecursive(folderPath, [".ts"]);
const externalScriptProcessing: Array<{ absPath: string; relPath: string }> = [];
const cssScriptProcessing: Array<{ absPath: string }> = [];

for (const tsFile of allTsFiles) {
    const tsPath = tsFile;
    const relativeTs = path.relative(srcDir, tsPath);
    const jsRelPath = relativeTs.replace(/\.ts$/, ".js");
    const jsAbsPath = path.join(projectRoot, "build", jsRelPath);

    if (tsFile.endsWith("_CSS.ts")) {
        cssScriptProcessing.push({ absPath: jsAbsPath });
    } else {
        externalScriptProcessing.push({ absPath: jsAbsPath, relPath: jsRelPath });
    }
}


const htmlOutPath = path.join(projectRoot, "output", "index.html");

const allGeneratedCss = await getCSSBlock(cssScriptProcessing);
const externalScriptUrls = await writeScriptBlock(externalScriptProcessing);
const domCommandUrls = await writeDomCommands(components, htmlOutPath);

// ── Produce HTML ─────────────────────────────────────────────────────────────
await compileComponentsToHtml(components, htmlOutPath, externalScriptUrls, allGeneratedCss, domCommandUrls);

