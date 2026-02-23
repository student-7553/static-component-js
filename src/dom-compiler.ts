import { Element } from "./element.js";

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

    function walk(el: Element, parentVar: string | null): string {
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
            if (name === "class") continue;
            commands.push(`${currentVar}.setAttribute(${JSON.stringify(name)}, ${JSON.stringify(value)});`);
        }

        // Set text content
        const textContent = el.getTextContent();
        if (textContent !== null) {
            commands.push(`${currentVar}.textContent = ${JSON.stringify(textContent)};`);
        }

        // Set click handler
        const onClick = el.getOnClickHandler();
        if (onClick !== null) {
            commands.push(`${currentVar}.onclick = ${onClick.toString()};`);
        }

        // Add children
        for (const child of el.getChildren()) {
            const childVar = walk(child, currentVar);
            commands.push(`${currentVar}.appendChild(${childVar});`);
        }

        return currentVar;
    }

    const rootVar = walk(element, null);
    commands.push(`return ${rootVar}`);

    return commands.join("\n");
}
