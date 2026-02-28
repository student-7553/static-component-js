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
export async function compileComponentsToHtml(components: Component[], filePath: string, externalScriptUrls: string[] = [], cssFileUrl: string = "", domCommandFileNames: string[] = []): Promise<void> {
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
            ${cssFileUrl ? `<link rel="stylesheet" href="${cssFileUrl}">` : ""}
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


async function writeScriptBlock(externalScriptProcessing: Array<{ absPath: string; relPath: string, load: boolean }>) {
    let externalScriptUrls: string[] = [];

    for (const { absPath, relPath, load } of externalScriptProcessing) {
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

        if (load) {
            externalScriptUrls.push("./" + relPath);
        }
    }

    return externalScriptUrls;
}

function processStyleNode(parentSelector: string, rules: Record<string, unknown>): string {
    let currentSelectorCss = "";
    let nestedCss = "";
    let hasProps = false;

    currentSelectorCss += `${parentSelector} {\n`;
    for (const [prop, val] of Object.entries(rules)) {
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            let newSelector = prop.startsWith(":")
                ? `${parentSelector}${prop}`
                : prop.startsWith("&")
                    ? prop.replace(/&/g, parentSelector)
                    : `${parentSelector} ${prop}`;
            nestedCss += processStyleNode(newSelector, val as Record<string, unknown>);
        } else {
            hasProps = true;
            currentSelectorCss += `  ${prop}: ${val};\n`;
        }
    }
    currentSelectorCss += "}\n";

    return (hasProps ? currentSelectorCss : "") + nestedCss;
}

async function getCSSBlock(cssScriptProcessing: Array<{ absPath: string, load: boolean }>) {
    let allGeneratedCss = "";
    for (const { absPath, load } of cssScriptProcessing) {
        if (!load) continue;
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
                allGeneratedCss += processStyleNode(selector, rules as Record<string, unknown>);
            }
        }
    }
    return allGeneratedCss;
}

async function writeDomCommands(components: Component[], filePath: string, loadFileKeys: Set<string>) {
    let domCommandFileNames = [];
    let index = 0;
    for (const component of components) {
        const element = component.getRoot();
        const domCommands = compileToDomCommands(element);
        const componentKey = component.key ? `'${component.key}'` : `'default'`;
        const params = component.parameters.join(", ");

        const domScript = `window.components = window.components || {};window.components[${componentKey}] = function(${params}) {${domCommands}};`;
        let minifiedDomJs = domScript;
        try { minifiedDomJs = (await minifyJs(domScript, { compress: true, mangle: true })).code ?? domScript; } catch { }
        let fileName = `${component.key}.js`;

        const domOutPath = path.join(path.dirname(filePath), fileName);
        fs.writeFileSync(domOutPath, minifiedDomJs, "utf-8");

        if (loadFileKeys.has(component.key)) {
            domCommandFileNames.push(fileName);
        }
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

function getFileLists(folderPath: string) {
    const allTsxFiles = collectFilesRecursive(folderPath, [".tsx"]).map((p: string) => path.resolve(p));
    const indexTsx = allTsxFiles.find((f: string) => path.basename(f) === "index.tsx");
    if (!indexTsx) {
        console.error(`index.tsx not found in folder: ${folderPath}`);
        process.exit(1);
    }

    const sortedTsxFiles = [indexTsx, ...allTsxFiles.filter(f => f !== indexTsx)];

    const allTsFiles = collectFilesRecursive(folderPath, [".ts"]).map(p => path.resolve(p));
    const allExternalTsFiles = allTsFiles.filter(f => !f.endsWith("_CSS.ts"));
    const allCssTsFiles = allTsFiles.filter(f => f.endsWith("_CSS.ts"));

    let tsxFileListToLoad = new Set<string>();
    let externalTsFileListToLoad = new Set<string>();
    let cssTsFileListToLoad = new Set<string>();

    const loadJsonPath = path.join(folderPath, "load.json");

    if (fs.existsSync(loadJsonPath)) {
        console.log(`Using load.json for compilation configuration...`);
        const loadConfig = JSON.parse(fs.readFileSync(loadJsonPath, "utf-8"));

        const expandPaths = (items: string[], allowedExts: string[], excludeFn?: (f: string) => boolean) => {
            let result: string[] = [];
            for (const item of items) {
                const fullPath = path.resolve(folderPath, item);
                if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                    result.push(...collectFilesRecursive(fullPath, allowedExts).map(p => path.resolve(p)));
                } else {
                    result.push(fullPath);
                }
            }
            if (excludeFn) {
                result = result.filter(f => !excludeFn(f));
            }
            return result;
        };

        if (loadConfig.components && Array.isArray(loadConfig.components)) {
            expandPaths(loadConfig.components, [".tsx"]).forEach(p => tsxFileListToLoad.add(p));
        }
        if (loadConfig.ts && Array.isArray(loadConfig.ts)) {
            expandPaths(loadConfig.ts, [".ts"], f => f.endsWith("_CSS.ts")).forEach(p => externalTsFileListToLoad.add(p));
        }
        if (loadConfig.css && Array.isArray(loadConfig.css)) {
            expandPaths(loadConfig.css, ["_CSS.ts"]).forEach(p => cssTsFileListToLoad.add(p));
        }
    } else {
        sortedTsxFiles.forEach(f => tsxFileListToLoad.add(f));
        allExternalTsFiles.forEach(f => externalTsFileListToLoad.add(f));
        allCssTsFiles.forEach(f => cssTsFileListToLoad.add(f));
    }

    return {
        allTsxFiles: sortedTsxFiles, allExternalTsFiles, allCssTsFiles,
        tsxFileListToLoad, externalTsFileListToLoad, cssTsFileListToLoad
    };
}

const {
    allTsxFiles, allExternalTsFiles, allCssTsFiles,
    tsxFileListToLoad, externalTsFileListToLoad, cssTsFileListToLoad
} = getFileLists(folderPath);

const components: Component[] = [];
const loadFileKeys = new Set<string>();

for (const tsxFile of allTsxFiles) {
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

    const key = path.basename(tsxFile, path.extname(tsxFile));
    components.push(new Component(element, key, parameterNames));

    if (tsxFileListToLoad.has(tsxFile)) {
        loadFileKeys.add(key);
    }
}

const externalScriptProcessing: Array<{ absPath: string; relPath: string, load: boolean }> = [];
const cssScriptProcessing: Array<{ absPath: string, load: boolean }> = [];

for (const tsFile of allExternalTsFiles) {
    const relativeTs = path.relative(srcDir, tsFile);
    const jsRelPath = relativeTs.replace(/\.ts$/, ".js");
    const jsAbsPath = path.join(projectRoot, "build", jsRelPath);
    externalScriptProcessing.push({ absPath: jsAbsPath, relPath: jsRelPath, load: externalTsFileListToLoad.has(tsFile) });
}

for (const tsFile of allCssTsFiles) {
    const relativeTs = path.relative(srcDir, tsFile);
    const jsRelPath = relativeTs.replace(/\.ts$/, ".js");
    const jsAbsPath = path.join(projectRoot, "build", jsRelPath);
    cssScriptProcessing.push({ absPath: jsAbsPath, load: cssTsFileListToLoad.has(tsFile) });
}


const htmlOutPath = path.join(projectRoot, "output", "index.html");

const allGeneratedCss = await getCSSBlock(cssScriptProcessing);
let cssFileUrl = "";
if (allGeneratedCss) {
    const cssOutPath = path.join(projectRoot, "output", "styles.css");
    fs.writeFileSync(cssOutPath, allGeneratedCss, "utf-8");
    cssFileUrl = "./styles.css";
}

const externalScriptUrls = await writeScriptBlock(externalScriptProcessing);

const domCommandUrls = await writeDomCommands(components, htmlOutPath, loadFileKeys);

// ── Produce HTML ─────────────────────────────────────────────────────────────
await compileComponentsToHtml(components, htmlOutPath, externalScriptUrls, cssFileUrl, domCommandUrls);

