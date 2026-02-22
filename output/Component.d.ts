import { Element } from "./Element.js";
export declare abstract class Component {
    protected rootElement: Element | null;
    constructor();
    /**
     * The render method should return an Element tree that represents the component's UI.
     */
    abstract render(): Element;
    getRoot(): Element;
}
//# sourceMappingURL=Component.d.ts.map