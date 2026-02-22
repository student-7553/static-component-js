import { Element } from "./element.js";

export abstract class Component {
    protected rootElement: Element | null = null;

    constructor() {
        this.rootElement = this.render();
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
