export function _inner_getComponentCache() {
    if (typeof window == 'undefined') {
        return null;
    }

    if (!(window as any).componentCache) {
        (window as any).componentCache = new Map<string, Node>();
    }
    return (window as any).componentCache;
}

export function _inner_renderComponent(key: string, parentId: string): void {
    const parent = document.getElementById(parentId);
    const cache = _inner_getComponentCache();
    if (!cache.has(key)) {
        const componentFn = (window as any).components?.[key];
        if (!componentFn) {
            console.error(`Component function not found for key: ${key}. Is it loaded?`);
            return;
        }
        cache.set(key, componentFn());
    }

    const cached = cache.get(key)!;
    const newElement = cached.cloneNode(true);
    parent!.appendChild(newElement);
}


export function _inner_loadComponent(componentKey: string): void {
    if (typeof window === 'undefined') return;

    // If the component function is already available, no need to load the script
    if ((window as any).components?.[componentKey]) return;

    // Avoid duplicate script tags
    const scriptSrc = `./${componentKey}.js`;
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.head.appendChild(script);
}

export const runtimeFunctions = [
    { name: "_inner_renderComponent", fn: _inner_renderComponent },
    { name: "_inner_getComponentCache", fn: _inner_getComponentCache },
    { name: "_inner_loadComponent", fn: _inner_loadComponent },
];
