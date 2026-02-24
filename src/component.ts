import { Element } from "./element.js";

export class Component {
    protected rootElement: Element;
    public uniqueId: string;
    public parameters: string[] = [];
    private onLoadHooks: Array<() => void> = [];

    constructor(rootElement: Element, uniqueId: string, parameters: string[] = []) {
        this.rootElement = rootElement;
        this.uniqueId = uniqueId;
        this.parameters = parameters;
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

    public getRoot(): Element {
        if (!this.rootElement) {
            throw new Error("Component not rendered yet");
        }
        return this.rootElement;
    }
}
