const componentCache = new Map<string, Node>();

export function _inner_getComponentCache() {
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

export function _inner_renderComponent(key: string, parentId: string): void {
    const parent = document.getElementById(parentId);
    const cache = _inner_getComponentCache();
    if (!cache.has(key)) {
        const componentFn = (window as any).components?.[key];
        cache.set(key, componentFn());
    }

    const cached = cache.get(key)!;
    const newElement = cached.cloneNode(true);
    parent!.appendChild(newElement);
}

export function _inner_removeComponent(id: string): void {
    const el = document.getElementById(id);
    el!.remove();
}

export const runtimeFunctions = [
    { name: "_inner_renderComponent", fn: _inner_renderComponent },
    { name: "_inner_removeComponent", fn: _inner_removeComponent },
    { name: "_inner_getComponentCache", fn: _inner_getComponentCache },
];
