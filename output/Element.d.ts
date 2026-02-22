export declare class Element {
    private tagName;
    private attributes;
    private children;
    private textContent;
    constructor(tagName: string);
    addChild(child: Element): void;
    setText(text: string): void;
    setAttribute(name: string, value: string): void;
    getChildren(): Element[];
    /**
     * Serializes this Element and its children into an HTML string.
     */
    toHtmlString(indent?: number): string;
}
//# sourceMappingURL=Element.d.ts.map