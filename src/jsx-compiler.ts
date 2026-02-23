import * as fs from "fs";
import * as path from "path";
import { compileComponentToHtml } from "./compiler.js";
import { Component } from "./component.js";
import { Element } from "./element.js";

/**
 * CLI entry-point: compiles a JSX/TSX component to HTML + JS output.
 *
 * The source file must be compiled with `npx tsc` first.
 * Its default export must be a function → Element (functional component).
 *
 * Usage:
 *   node output/jsx-compiler.js <path-to-source.tsx>
 *
 * Example:
 *   node output/jsx-compiler.js src/examples/App.tsx
 *
 * Outputs:
 *   output/index.html  – Full compiled HTML page
 *   output/app.js      – Copy of the compiled JS module
 */

const [, , sourceArg] = process.argv;

if (!sourceArg) {
    console.error("Usage: node output/jsx-compiler.js <path-to-.tsx-file>");
    process.exit(1);
}

// Resolve the compiled JS counterpart of the source .tsx file.
// e.g. src/examples/App.tsx → output/examples/App.js
const srcPath = path.resolve(sourceArg);
const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");

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
    console.error("The module has no callable default export (expected a functional component).");
    process.exit(1);
}

// Call the functional component with empty props
const rootElement = (DefaultExport as () => Element)();

if (!(rootElement instanceof Element)) {
    console.error("The default export did not return an Element instance.");
    process.exit(1);
}

const uniqueId = path.basename(sourceArg, path.extname(sourceArg));
const component = new Component(rootElement, uniqueId);

// ── Produce HTML ─────────────────────────────────────────────────────────────
const htmlOutPath = path.join(projectRoot, "output", "index.html");
compileComponentToHtml(component, htmlOutPath);

// ── Copy JS bundle ────────────────────────────────────────────────────────────
const jsOutPath = path.join(projectRoot, "output", "app.js");
fs.copyFileSync(jsAbsPath, jsOutPath);
console.log(`JS bundle written to:  ${path.resolve(jsOutPath)}`);
