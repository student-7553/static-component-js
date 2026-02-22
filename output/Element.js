export class Element {
    tagName;
    attributes = new Map();
    children = [];
    textContent = null;
    constructor(tagName) {
        this.tagName = tagName;
    }
    addChild(child) {
        this.children.push(child);
    }
    setText(text) {
        this.textContent = text;
    }
    setAttribute(name, value) {
        this.attributes.set(name, value);
    }
    getChildren() {
        return this.children;
    }
    /**
     * Serializes this Element and its children into an HTML string.
     */
    toHtmlString(indent = 0) {
        const pad = "  ".repeat(indent);
        const attrs = Array.from(this.attributes.entries())
            .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
            .join("");
        const openTag = `<${this.tagName}${attrs}>`;
        const closeTag = `</${this.tagName}>`;
        if (this.children.length > 0) {
            const childLines = this.children
                .map((c) => c.toHtmlString(indent + 1))
                .join("\n");
            return `${pad}${openTag}\n${childLines}\n${pad}${closeTag}`;
        }
        if (this.textContent !== null) {
            return `${pad}${openTag}${escapeHtml(this.textContent)}${closeTag}`;
        }
        return `${pad}${openTag}${closeTag}`;
    }
}
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeAttr(value) {
    return value.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}
//# sourceMappingURL=Element.js.map