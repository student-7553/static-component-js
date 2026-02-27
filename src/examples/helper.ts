export function getValue(key: string) {
    if (typeof window == 'undefined') {
        return null;
    }

    if (!(window as any).kv) {
        (window as any).kv = {};
    }
    return (window as any).kv[key];
}


export function setValue(key: string, value: string) {
    if (typeof window == 'undefined') {
        return;
    }
    if (!window) {
        return;
    }
    (window as any).kv[key] = value;
}

export function removeComponentHelper(parentId: string) {
    const parentElement = document.getElementById(parentId);

    if (!parentElement) {
        return;

    }
    const childElements = Array.from(parentElement.children);
    for (let counter = 0; counter <= childElements.length; counter++) {
        childElements[counter]?.remove();
    }

}