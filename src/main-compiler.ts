import * as fs from "fs";
import * as path from "path";
import { compileComponentsToHtml } from "./compiler.js";
import { Component } from "./component.js";
import { Element } from "./element.js";

/**
 * CLI entry-point: compiles one or more JSX/TSX components to HTML + JS output.
 *
 * All source files must be compiled with `npx tsc` first.
 * The first file is the "root" component (used for static HTML).
 * All files have their DOM commands added to index.html.
 *
 * Usage:
 *   node output/jsx-compiler.js <path-to-root.tsx> [other-components.tsx...]
 *
 * Example:
 *   node output/jsx-compiler.js src/examples/App.tsx src/examples/Counter.tsx
 *
 * Outputs:
 *   output/index.html  – Full compiled HTML page
 *   output/app.js      – Copy of the first compiled JS module
 */

const sourceArgs = process.argv.slice(2);

if (sourceArgs.length === 0) {
    console.error("Usage: node output/jsx-compiler.js <path-to-root.tsx> [other-components.tsx...]");
    process.exit(1);
}

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");

const components: Component[] = [];

for (const sourceArg of sourceArgs) {
    // Resolve the compiled JS counterpart of the source .tsx file.
    // e.g. src/examples/App.tsx → output/examples/App.js
    const srcPath = path.resolve(sourceArg);
    const relativeSrc = path.relative(srcDir, srcPath);
    const jsRelPath = relativeSrc.replace(/\.tsx?$/, ".js");
    const jsAbsPath = path.join(projectRoot, "output", jsRelPath);

    if (!fs.existsSync(jsAbsPath)) {
        console.error(`Compiled JS not found at: ${jsAbsPath}`);
        console.error("Run  npx tsc  first, then retry.");
        process.exit(1);
    }

    // Dynamically import the compiled JS module
    const mod = await import(jsAbsPath) as { default?: unknown };

    const DefaultExport = mod.default;
    if (typeof DefaultExport !== "function") {
        console.error(`Module ${sourceArg} has no callable default export.`);
        process.exit(1);
    }

    // Extract parameter names from the component function
    const parameterNames = getParameterNames(DefaultExport as Function);

    // Call the functional component with placeholders for its parameters
    const placeholders = parameterNames.map(p => `$${p}`);
    const componentFunction = DefaultExport as (...args: string[]) => Element;
    // console.log("are here:", ...placeholders);
    // const element = componentFunction(...placeholders);
    const element = componentFunction(...placeholders);

    if (!(element instanceof Element)) {
        console.error(`Default export of ${sourceArg} did not return an Element instance.`);
        process.exit(1);
    }

    const uniqueId = path.basename(sourceArg, path.extname(sourceArg));
    components.push(new Component(element, uniqueId, parameterNames));

    // For the first component, also copy its JS bundle as the main app.js
    if (components.length === 1) {
        const jsOutPath = path.join(projectRoot, "output", "app.js");
        fs.copyFileSync(jsAbsPath, jsOutPath);
        console.log(`JS bundle (root) written to:  ${path.resolve(jsOutPath)}`);
    }
}

// ── Produce HTML ─────────────────────────────────────────────────────────────
const htmlOutPath = path.join(projectRoot, "output", "index.html");
compileComponentsToHtml(components, htmlOutPath);

/**
 * Extracts parameter names from a function's string representation.
 */
function getParameterNames(fn: Function): string[] {
    const fnStr = fn.toString();
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    return result || [];
}
