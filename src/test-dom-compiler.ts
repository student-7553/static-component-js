import { h } from "./jsx-runtime.js";
import { compileToDomCommands } from "./dom-compiler.js";

const el = h("div", { class: "container", onClick: () => console.log("clicked") },
    h("h1", null, "Hello DOM"),
    h("p", null, "This was generated via DOM commands.")
);

const domCommands = compileToDomCommands(el);
console.log("--- Generated DOM Commands ---");
console.log(domCommands);
console.log("--- End ---");
