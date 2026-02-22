export class Element {
    private tagName: string;
    private attributes: Map<string, string> = new Map();
    private children: Element[] = [];
    private textContent: string | null = null;

    constructor(tagName: string) {
        this.tagName = tagName;
    }

    public addChild(child: Element): void {
        this.children.push(child);
    }

    public setText(text: string): void {
        this.textContent = text;
    }

    public setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
    }

    public getChildren(): Element[] {
        return this.children;
    }

    /**
     * Serializes this Element and its children into an HTML string.
     */
    public toHtmlString(indent: number = 0): string {
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

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
    return value.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}
