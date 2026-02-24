export function renderComponent(key: string, parentId: string, ...args: any[]): void {
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
    let newElement = componentFn(...args);
    parent.appendChild(newElement);
    return newElement;
}

export function removeComponent(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
        console.error(`Component not found: ${id}`);
        return;
    }
    el.remove();
}
