/**
 * Global JSX type declarations.
 *
 * TypeScript reads the `JSX` namespace to type-check JSX expressions when
 * `"jsx": "react"` / `"jsxFactory"` are configured in tsconfig.
 *
 * This file is automatically included in the compilation because it lives
 * inside the project root (tsconfig picks up all .d.ts files by default).
 */
declare namespace JSX {
    /**
     * The type that every JSX expression evaluates to.
     * Must match the return type of the h() factory function.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Element extends InstanceType<typeof import("./compiler/element.ts").Element> { }

    /** Props accepted by any intrinsic HTML element. */
    interface IntrinsicElementProps {
        children?: JSX.Element | JSX.Element[] | string | number;
        class?: string;
        id?: string;
        style?: string | Record<string, string>;
        href?: string;
        src?: string;
        alt?: string;
        type?: string;
        name?: string;
        value?: string;
        placeholder?: string;
        onClick?: import("./compiler/element.ts").OnClickObject;
        [attr: string]: unknown;
    }

    /** Accept any lowercase HTML tag name. */
    interface IntrinsicElements {
        [tag: string]: IntrinsicElementProps;
    }
}
