import { Element } from "./element.js";

export abstract class Component {
    protected rootElement: Element | null = null;
    private onLoadHooks: Array<() => void> = [];

    constructor() {
        this.rootElement = this.render();
    }

    /**
     * Registers a callback to be invoked when the component is loaded in the browser.
     * When compiling to HTML, all registered hooks on the root component are wired
     * into window.onload in the emitted <script> block.
     */
    public addOnLoadHook(callback: () => void): void {
        this.onLoadHooks.push(callback);
    }

    /** Returns all registered onLoad callbacks (used by the compiler). */
    public getOnLoadHooks(): Array<() => void> {
        return this.onLoadHooks;
    }

    /**
     * The render method should return an Element tree that represents the component's UI.
     */
    public abstract render(): Element;

    public getRoot(): Element {
        if (!this.rootElement) {
            throw new Error("Component not rendered yet");
        }
        return this.rootElement;
    }
}
