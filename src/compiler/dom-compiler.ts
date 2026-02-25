import { Element } from "./element.js";
import { Component } from "./component.js";

/**
 * Compiles an Element tree into a series of JavaScript commands that,
 * when executed in a browser environment, will reconstruct the DOM tree.
 * 
 * @param element The root Element to compile.
 * @param varPrefix Prefix for variable names used in the generated script.
 * @returns A string of JavaScript commands.
 */
export function compileToDomCommands(element: Element, varPrefix: string = "el"): string {
    const commands: string[] = [];
    let counter = 0;

    function walk(el: Element): string {
        const currentVar = `${varPrefix}${++counter}`;

        // Create element
        commands.push(`const ${currentVar} = document.createElement("${el.getTagName()}");`);

        // Set attributes
        const attributes = el.getAttributes();

        // Add unique class name
        const uniqueClass = el.getUniqueClassName();
        const existingClass = attributes.get("class");
        const finalClass = existingClass ? `${uniqueClass} ${existingClass}` : uniqueClass;
        commands.push(`${currentVar}.className = ${JSON.stringify(finalClass)};`);

        for (const [name, value] of attributes.entries()) {
            if (name === "class") {
                continue;
            }
            if (name === "style") {
                // Use cssText for inline styles – avoids setAttribute quirks on style
                const val = value.startsWith("$") ? value.substring(1) : JSON.stringify(value);
                commands.push(`${currentVar}.style.cssText = ${val};`);
                continue;
            }
            const val = value.startsWith("$") ? value.substring(1) : JSON.stringify(value);
            commands.push(`${currentVar}.setAttribute(${JSON.stringify(name)}, ${val});`);
        }

        // Set text content
        const textContent = el.getTextContent();
        if (textContent !== null) {
            const val = textContent.startsWith("$") ? textContent.substring(1) : JSON.stringify(textContent);
            commands.push(`${currentVar}.textContent = ${val};`);
        }

        // Set click handler
        const onClick = el.getOnClickHandler();
        if (onClick !== null) {
            commands.push(`${currentVar}.onclick = ${onClick.toString()};`);
        }

        // Add children
        for (const child of el.getChildren()) {
            if (child instanceof Component) {
                // Render component child via its registered factory in window.components
                const childVar = `${varPrefix}${++counter}`;
                const componentKey = child.uniqueId;
                commands.push(`const ${childVar} = window.components['${componentKey}']();`);
                commands.push(`${currentVar}.appendChild(${childVar});`);
                continue;
            }

            const childVar = walk(child);
            commands.push(`${currentVar}.appendChild(${childVar});`);
        }

        return currentVar;
    }

    const rootVar = walk(element);
    commands.push(`return ${rootVar}`);

    return commands.join("\n");
}
