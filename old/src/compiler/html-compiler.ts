import { Element } from "./element.js";
import { Component } from "./component.js";

/**
 * Serializes an Element and its children into an HTML string.
 * The element's unique class name is always included in the class attribute
 * so the compiler can attach event listeners by selector.
 */
export function toHtmlString(element: Element): string {
    const attributes = element.getAttributes();
    const tagName = element.getTagName();
    const children = element.getChildren();
    const textContent = element.getTextContent();

    const mergedAttrs = new Map(attributes);

    const onClick = element.getOnClickHandler();
    if (onClick) {
        let handlerStr = "";
        if (onClick.event === "render") {
            handlerStr = `window.inner.renderComponent('${onClick.component}', '${onClick.target}')`;
        } else if (onClick.event === "function") {
            const args = onClick.data?.map(t => {
                return t.startsWith("$") ? `'" + ${t.substring(1)} + "'` : `'${t}'`;
            });
            handlerStr = `${onClick.name}(${args ? args.join(", ") : ""})`;
        }
        mergedAttrs.set("onclick", handlerStr);
    }

    const attrs = Array.from(mergedAttrs.entries())
        .map(([k, v]) => {
            return ` ${k}="${escapeAttr(v)}"`;
        })
        .join("");
    const openTag = `<${tagName}${attrs}>`;
    const closeTag = `</${tagName}>`;

    if (children.length > 0) {
        const childLines = children
            .map((c) => c instanceof Component ? toHtmlString(c.getRoot()) : toHtmlString(c))
            .join("\n");
        return `${openTag}\n${childLines}\n${closeTag}`;
    }

    if (textContent.length > 0) {
        const text = textContent.map(t => escapeHtml(t)).join("");
        return `${openTag}${text}${closeTag}`;
    }

    return `${openTag}${closeTag}`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
