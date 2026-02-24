import { Element } from "./element.js";

type Child = Element | string | number | boolean | null | undefined;

interface Props {
    children?: Child | Child[];
    onClick?: () => void;
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
): Element {
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
        return type(mergedProps);
    }

    // ── Intrinsic element ─────────────────────────────────────────────────────
    const el = new Element(type);

    const { onClick, children: propsChildren, ...attrs } = props ?? {};

    // Wire click handler
    if (typeof onClick === "function") {
        el.setOnClick(onClick as () => void);
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
        if (child instanceof Element) {
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
        if (child instanceof Element) {
            wrapper.addChild(child);
        }
    }
    return wrapper;
}