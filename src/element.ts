let _elementCounter = 0;

export class Element {
    private tagName: string;
    private attributes: Map<string, string> = new Map();
    private children: Element[] = [];
    private textContent: string | null = null;

    /** Stable, unique CSS class name used to wire up event handlers at compile time. */
    private readonly uniqueClassName: string;

    /** Optional click handler serialised into the compiled <script> block. */
    private onClickHandler: (() => void) | null = null;

    constructor(tagName: string) {
        this.tagName = tagName;
        this.uniqueClassName = `sc-el-${++_elementCounter}`;
    }

    public getUniqueClassName(): string {
        return this.uniqueClassName;
    }

    public setOnClick(callback: () => void): void {
        this.onClickHandler = callback;
    }

    public getOnClickHandler(): (() => void) | null {
        return this.onClickHandler;
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
     * The element's unique class name is always included in the class attribute
     * so the compiler can attach event listeners by selector.
     */
    public toHtmlString(indent: number = 0): string {
        const pad = "  ".repeat(indent);

        // Merge the unique class name with any user-supplied class attribute.
        const existingClass = this.attributes.get("class");
        const classValue = existingClass
            ? `${this.uniqueClassName} ${existingClass}`
            : this.uniqueClassName;
        const mergedAttrs = new Map(this.attributes);
        mergedAttrs.set("class", classValue);

        const attrs = Array.from(mergedAttrs.entries())
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
