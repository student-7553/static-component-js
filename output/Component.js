import { Element } from "./Element.js";
export class Component {
    rootElement = null;
    constructor() {
        this.rootElement = this.render();
    }
    getRoot() {
        if (!this.rootElement) {
            throw new Error("Component not rendered yet");
        }
        return this.rootElement;
    }
}
//# sourceMappingURL=Component.js.map