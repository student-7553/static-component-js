import { Element } from "./element.js";
import type { OnClickObject } from "./element.js";
import { Component } from "./component.js";

type Child = Element | Component | string | number | boolean | null | undefined;

interface Props {
    children?: Child | Child[];
    onClick?: OnClickObject;
    [key: string]: unknown;
}

/**
 * JSX factory function. TypeScript invokes this for every JSX element when
 * `"jsxFactory": "h"` is set in tsconfig.
 *
 * In every .tsx file, import it explicitly:
 *   import { h, Fragment } from "../jsx-runtime.js";
 *
 * Supports:
 *   - Intrinsic elements: <div>, <button>, etc.  → new Element(tagName)
 *   - Function components: <App />               → App(props)
 *   - onClick prop                               → el.setOnClick(fn)
 *   - All other props                            → el.setAttribute(key, value)
 *   - String/number children                    → el.setText(...)
 *   - Element children                           → el.addChild(...)
 */
export function h(
    type: string | ((props: Props) => Element),
    props: Props | null,
    ...children: Child[]
): Element | Component {
    // ── Function component ────────────────────────────────────────────────────
    if (typeof type === "function") {
        const mergedProps: Props = {
            ...(props ?? {}),
            children:
                children.length === 1
                    ? children[0]
                    : children.length > 1
                        ? children
                        : undefined,
        };
        const result = type(mergedProps);

        // Functions prefixed with "INNER_" are treated as inline elements,
        // not as separate components.
        if (type.name.endsWith("_INNER")) {
            return result;
        }

        // Wrap in a Component to preserve the component boundary
        // so the dom-compiler can emit window.components[name]() calls
        return new Component(result, type.name);
    }

    // ── Intrinsic element ─────────────────────────────────────────────────────
    const el = new Element(type);

    const { onClick, children: propsChildren, ...attrs } = props ?? {};

    // Wire click handler
    if (onClick != null && typeof onClick === "object") {
        el.setOnClick(onClick as OnClickObject);
    }

    // Handle `style` as a CSS object (like JSX/React inline styles)
    if (attrs.style != null && typeof attrs.style === "object" && !Array.isArray(attrs.style)) {
        const cssString = Object.entries(attrs.style as Record<string, unknown>)
            .filter(([, v]) => v != null)
            .map(([prop, val]) => {
                // Convert camelCase to kebab-case (e.g. fontSize → font-size)
                const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
                return `${cssProp}:${String(val)}`;
            })
            .join(";");
        el.setAttribute("style", cssString);
        delete (attrs as Record<string, unknown>).style;
    }

    // Set HTML attributes (skip non-serialisable values)
    for (const [key, value] of Object.entries(attrs)) {
        if (value != null && typeof value !== "function" && typeof value !== "object") {
            el.setAttribute(key, String(value));
        }
    }

    // Children passed as rest args take priority over props.children
    const effectiveChildren: Child[] =
        children.length > 0
            ? children
            : Array.isArray(propsChildren)
                ? propsChildren
                : propsChildren != null
                    ? [propsChildren]
                    : [];

    for (const child of effectiveChildren) {
        if (child instanceof Element || child instanceof Component) {
            el.addChild(child);
        } else if (child != null && child !== true && child !== false) {
            el.setText(String(child));
        }
    }

    return el;
}

/**
 * Fragment placeholder. Not rendered itself; its children are unwrapped.
 * Use as: `<Fragment>...</Fragment>` or the shorthand `<>...</>`.
 */
export function Fragment(props: Props): Element {
    // Return a transparent wrapper div; for truly fragment-less output
    // the compiler would need to handle this specially.
    const wrapper = new Element("div");
    const kids = Array.isArray(props.children)
        ? props.children
        : props.children != null
            ? [props.children]
            : [];
    for (const child of kids) {
        if (child instanceof Element || child instanceof Component) {
            wrapper.addChild(child);
        }
    }
    return wrapper;
}