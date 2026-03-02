
export function _inner_renderComponent(key: string, parentId: string, data?: any): void {
    const parent = document.getElementById(parentId);

    const componentFn = (window as any).components?.[key];
    if (!componentFn) {
        console.error(`Component function not found for key: ${key}. Is it loaded?`);
        return;
    }

    const newElement = componentFn(data);

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
    { name: "_inner_loadComponent", fn: _inner_loadComponent },
];
