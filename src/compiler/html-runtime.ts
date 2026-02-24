const componentCache = new Map<string, Node>();

export function renderComponent(key: string, parentId: string): void {
    const parent = document.getElementById(parentId);
    if (!parent) {
        console.error(`Render target not found: #${parentId}`);
        return;
    }
    const componentFn = (window as any).Components?.[key];
    if (typeof componentFn !== 'function') {
        console.error(`Component not found: ${key}`);
        return;
    }

    if (!componentCache.has(key)) {
        componentCache.set(key, componentFn());
    }

    const cached = componentCache.get(key)!;
    const newElement = cached.cloneNode(true);
    parent.appendChild(newElement);
}

export function removeComponent(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
        console.error(`Component not found: ${id}`);
        return;
    }
    el.remove();
}

export const runtimeFunctions = [
    { name: "renderComponent", fn: renderComponent },
    { name: "removeComponent", fn: removeComponent },
];
