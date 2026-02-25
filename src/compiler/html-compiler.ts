import { Element } from "./element.js";
import { Component } from "./component.js";

/**
 * Serializes an Element and its children into an HTML string.
 * The element's unique class name is always included in the class attribute
 * so the compiler can attach event listeners by selector.
 */
export function toHtmlString(element: Element): string {
    // const pad = "  ".repeat(indent);

    // Merge the unique class name with any user-supplied class attribute.
    const attributes = element.getAttributes();
    const uniqueClassName = element.getUniqueClassName();
    const tagName = element.getTagName();
    const children = element.getChildren();
    const textContent = element.getTextContent();

    const existingClass = attributes.get("class");
    const classValue = existingClass
        ? `${uniqueClassName} ${existingClass}`
        : uniqueClassName;
    const mergedAttrs = new Map(attributes);
    mergedAttrs.set("class", classValue);

    const attrs = Array.from(mergedAttrs.entries())
        .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
        .join("");
    const openTag = `<${tagName}${attrs}>`;
    const closeTag = `</${tagName}>`;

    if (children.length > 0) {
        const childLines = children
            .map((c) => c instanceof Component ? toHtmlString(c.getRoot()) : toHtmlString(c))
            .join("\n");
        return `${openTag}\n${childLines}\n${closeTag}`;
    }

    if (textContent !== null) {
        return `${openTag}${escapeHtml(textContent)}${closeTag}`;
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
    return value.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}
