import type { Component } from "./component.js";

let _elementCounter = 0;

export class Element {
    private tagName: string;
    private attributes: Map<string, string> = new Map();
    private children: (Element | Component)[] = [];
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

    public getTagName(): string {
        return this.tagName;
    }

    public getAttributes(): Map<string, string> {
        return this.attributes;
    }

    public getTextContent(): string | null {
        return this.textContent;
    }

    public setOnClick(callback: () => void): void {
        this.onClickHandler = callback;
    }

    public getOnClickHandler(): (() => void) | null {
        return this.onClickHandler;
    }

    public addChild(child: Element | Component): void {
        this.children.push(child);
    }

    public setText(text: string): void {
        this.textContent = text;
    }

    public setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
    }

    public getChildren(): (Element | Component)[] {
        return this.children;
    }

}