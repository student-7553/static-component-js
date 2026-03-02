import { describe, it, expect, beforeEach } from "vitest";
import { Element } from "./element.js";
import { toHtmlString } from "./html-compiler.js";
import { compileToDomCommands } from "./dom-compiler.js";
import { h, Fragment } from "./jsx-compile-time.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Strip the auto-generated `sc-el-N` class from HTML for stable snapshots. */
function stripClass(html: string): string {
    return html.replace(/class="sc-el-\d+(\s[^"]*)?"/g, (_, rest) =>
        rest ? `class="${rest.trim()}"` : `class=""`
    );
}

/** Strip `className = "sc-el-N..."` lines from DOM command strings. */
function stripClassLines(commands: string): string {
    return commands
        .split("\n")
        .filter(l => !l.includes(".className ="))
        .join("\n");
}

// ─── Element ──────────────────────────────────────────────────────────────────

describe("Element", () => {
    let el: Element;

    beforeEach(() => {
        el = new Element("div");
    });

    it("stores the tag name", () => {
        expect(el.getTagName()).toBe("div");
    });

    it("stores a single text part", () => {
        el.addText("hello");
        expect(el.getTextContent()).toEqual(["hello"]);
    });

    it("stores multiple text parts individually", () => {
        el.addText("Hello ");
        el.addText("$name");
        el.addText("!");
        expect(el.getTextContent()).toEqual(["Hello ", "$name", "!"]);
    });

    it("setAttribute stores key/value pairs", () => {
        el.setAttribute("id", "root");
        expect(el.getAttributes().get("id")).toBe("root");
    });

    it("addChild appends child elements", () => {
        const child = new Element("span");
        el.addChild(child);
        expect(el.getChildren()).toHaveLength(1);
        expect(el.getChildren()[0]).toBe(child);
    });

    it("setOnClick stores the handler", () => {
        el.setOnClick({ event: "function", name: "myFn" });
        expect(el.getOnClickHandler()).toMatchObject({ event: "function", name: "myFn" });
    });

    it("setOnClick: render event stores component and target", () => {
        el.setOnClick({ event: "render", component: "Card", target: "container" });
        const handler = el.getOnClickHandler();
        expect(handler).toMatchObject({ event: "render", component: "Card", target: "container" });
    });
});

// ─── html-compiler ────────────────────────────────────────────────────────────

describe("toHtmlString", () => {
    it("renders an empty element", () => {
        const el = new Element("div");
        expect(stripClass(toHtmlString(el))).toBe('<div class=""></div>');
    });

    it("renders a static text element", () => {
        const el = new Element("p");
        el.addText("Hello world");
        expect(stripClass(toHtmlString(el))).toBe('<p class="">Hello world</p>');
    });

    it("escapes HTML special chars in text", () => {
        const el = new Element("p");
        el.addText("<b>bold</b> & more");
        expect(stripClass(toHtmlString(el))).toContain("&lt;b&gt;bold&lt;/b&gt; &amp; more");
    });

    it("renders multiple text parts joined", () => {
        const el = new Element("p");
        el.addText("Hello ");
        el.addText("$name");
        el.addText("!");
        const html = stripClass(toHtmlString(el));
        // Static HTML simply concatenates parts ($ is NOT special in HTML output)
        expect(html).toContain("Hello $name!");
    });

    it("renders a child element", () => {
        const parent = new Element("div");
        const child = new Element("span");
        child.addText("hi");
        parent.addChild(child);
        const html = stripClass(toHtmlString(parent));
        expect(html).toContain("<span");
        expect(html).toContain("hi");
    });

    it("renders a function onclick handler with static args", () => {
        const el = new Element("button");
        el.setOnClick({ event: "function", name: "doThing", data: ["cardContainer"] });
        const html = toHtmlString(el);
        expect(html).toContain("doThing(");
        expect(html).toContain("cardContainer");
    });

    it("renders a function onclick handler with a dynamic $ arg", () => {
        const el = new Element("button");
        el.setOnClick({ event: "function", name: "deleteTask", data: ["$id"] });
        const html = toHtmlString(el);
        // Dynamic args use string concatenation pattern in HTML output
        expect(html).toContain("deleteTask(");
        expect(html).toContain("id");
    });

    it("renders a render onclick handler", () => {
        const el = new Element("button");
        el.setOnClick({ event: "render", component: "Card", target: "container" });
        const html = toHtmlString(el);
        expect(html).toContain("window.inner._inner_renderComponent('Card', 'container')");
    });

    it("renders attributes on the element", () => {
        const el = new Element("input");
        el.setAttribute("type", "text");
        el.setAttribute("id", "my-input");
        const html = toHtmlString(el);
        expect(html).toContain('type="text"');
        expect(html).toContain('id="my-input"');
    });

    it("merges an existing class attribute with the unique class", () => {
        const el = new Element("div");
        el.setAttribute("class", "my-class");
        const html = toHtmlString(el);
        expect(html).toMatch(/class="sc-el-\d+ my-class"/);
    });
});

// ─── dom-compiler ─────────────────────────────────────────────────────────────

describe("compileToDomCommands", () => {
    it("creates an element", () => {
        const el = new Element("div");
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain('document.createElement("div")');
    });

    it("static-only textContent uses JSON.stringify literal", () => {
        const el = new Element("p");
        el.addText("Hello world");
        const cmds = stripClassLines(compileToDomCommands(el));
        expect(cmds).toContain('.textContent = "Hello world"');
    });

    it("single dynamic part uses bare variable reference", () => {
        const el = new Element("p");
        el.addText("$name");
        const cmds = stripClassLines(compileToDomCommands(el));
        expect(cmds).toContain(".textContent = name");
    });

    it("mixed text parts concatenate correctly", () => {
        const el = new Element("p");
        el.addText("Hello ");
        el.addText("$name");
        el.addText("!");
        const cmds = stripClassLines(compileToDomCommands(el));
        expect(cmds).toContain('.textContent = "Hello " + name + "!"');
    });

    it("sets a static attribute", () => {
        const el = new Element("input");
        el.setAttribute("type", "text");
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain('setAttribute("type", "text")');
    });

    it("sets a dynamic $ attribute as a bare variable", () => {
        const el = new Element("div");
        el.setAttribute("id", "$myId");
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain('setAttribute("id", myId)');
    });

    it("generates a function onclick with static args", () => {
        const el = new Element("button");
        el.setOnClick({ event: "function", name: "doThing", data: ["cardContainer"] });
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain("doThing(");
        expect(cmds).toContain("cardContainer");
    });

    it("generates a function onclick with a dynamic $ arg", () => {
        const el = new Element("button");
        el.setOnClick({ event: "function", name: "deleteTask", data: ["$taskId"] });
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain("deleteTask(");
        expect(cmds).toContain("taskId");
    });

    it("generates a render onclick", () => {
        const el = new Element("button");
        el.setOnClick({ event: "render", component: "Card", target: "container" });
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain("window.inner._inner_renderComponent('Card', 'container')");
    });

    it("appends child elements", () => {
        const parent = new Element("div");
        const child = new Element("span");
        parent.addChild(child);
        const cmds = compileToDomCommands(parent);
        expect(cmds).toContain("appendChild(");
    });

    it("inline style is set via cssText", () => {
        const el = new Element("div");
        el.setAttribute("style", "color:red;font-size:12px");
        const cmds = compileToDomCommands(el);
        expect(cmds).toContain("style.cssText");
    });
});

// ─── jsx-compile-time (h factory) ─────────────────────────────────────────────

describe("h (JSX factory)", () => {
    it("creates an Element for intrinsic tags", () => {
        const el = h("div", null);
        expect(el).toBeInstanceOf(Element);
        expect((el as Element).getTagName()).toBe("div");
    });

    it("adds a string child as text", () => {
        const el = h("p", null, "hello") as Element;
        expect(el.getTextContent()).toEqual(["hello"]);
    });

    it("adds a number child as text", () => {
        const el = h("p", null, 42 as any) as Element;
        expect(el.getTextContent()).toEqual(["42"]);
    });

    it("ignores false/null/undefined children", () => {
        const el = h("p", null, false as any, null, undefined) as Element;
        expect(el.getTextContent()).toEqual([]);
        expect(el.getChildren()).toHaveLength(0);
    });

    it("sets arbitrary attributes", () => {
        const el = h("input", { type: "text", id: "my-input" }) as Element;
        expect(el.getAttributes().get("type")).toBe("text");
        expect(el.getAttributes().get("id")).toBe("my-input");
    });

    it("converts style object to css string", () => {
        const el = h("div", { style: { color: "red", fontSize: "12px" } }) as Element;
        const style = el.getAttributes().get("style");
        expect(style).toContain("color:red");
        expect(style).toContain("font-size:12px");
    });

    it("wires onClick handler", () => {
        const el = h("button", {
            onClick: { event: "function", name: "doIt" }
        }) as Element;
        expect(el.getOnClickHandler()).toMatchObject({ event: "function", name: "doIt" });
    });

    it("nests child elements", () => {
        const child = h("span", null, "inner") as Element;
        const parent = h("div", null, child) as Element;
        expect(parent.getChildren()).toHaveLength(1);
        expect(parent.getChildren()[0]).toBe(child);
    });
});
