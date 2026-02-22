import { Component } from "./component.js";
import { Element } from "./element.js";
import { compileToHtml } from "./compiler.js";

class MyCustomComponent extends Component {
    public render(): Element {
        const container = new Element("div");
        container.setAttribute("class", "my-component");

        const title = new Element("h1");
        title.setText("Hello from MyCustomComponent!");

        const description = new Element("p");
        description.setText("This is a tree of Element classes inside a Component.");

        container.addChild(title);
        container.addChild(description);

        return container;
    }
}

// Compile the component to an HTML file
const myComp = new MyCustomComponent();
compileToHtml(myComp, "./output/index.html");
