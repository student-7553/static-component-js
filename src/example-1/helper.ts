function getValue(key: string) {
    if (typeof window == 'undefined') {
        return null;
    }

    if (!(window as any).kv) {
        (window as any).kv = {};
    }
    return (window as any).kv[key];
}


function setValue(key: string, value: string) {
    if (typeof window == 'undefined') {
        return;
    }
    if (!window) {
        return;
    }
    (window as any).kv[key] = value;
}


function removeComponentHelper(parentId: string) {
    const parentElement = document.getElementById(parentId);
    if (!parentElement) {
        console.error(parentId + " element not found");
        return;

    }
    const childElements = Array.from(parentElement.children);
    for (let counter = 0; counter <= childElements.length; counter++) {
        childElements[counter]?.remove();
    }
}

function loadComponentHelper() {
    (window as any).inner._inner_loadComponent("Simple");
}