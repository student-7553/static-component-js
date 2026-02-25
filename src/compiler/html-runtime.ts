const componentCache = new Map<string, Node>();

export function getComponentCache() {
    if (typeof componentCache !== 'undefined') {
        return componentCache;
    }

    if (typeof window == 'undefined') {
        return null;
    }

    if (!(window as any).kv) {
        (window as any).componentCache = new Map<string, Node>();
    }
    return (window as any).componentCache;
}

export function renderComponent(key: string, parentId: string): void {
    const parent = document.getElementById(parentId);
    if (!parent) {
        console.error(`Render target not found: #${parentId}`);
        return;
    }

    const cache = getComponentCache();
    if (!cache) {
        console.error(`Component cache unavailable`);
        return;
    }

    if (!cache.has(key)) {
        const componentFn = (window as any).components?.[key];
        if (typeof componentFn !== 'function') {
            console.error(`Component not found: ${key}`);
            return;
        }
        cache.set(key, componentFn());
    }

    const cached = cache.get(key)!;
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
    { name: "getComponentCache", fn: getComponentCache },
];
