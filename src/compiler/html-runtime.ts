
function renderComponent(key: string, parentId: string, data?: string[]): void {
    const parent = document.getElementById(parentId);

    const componentFn = window.components?.[key];
    if (!componentFn) {
        throw `Component function not found for key: ${key}. Is it loaded?`;
    }
    let newElement;
    if (data) {
        newElement = componentFn(...data);
    } else {
        newElement = componentFn();
    }

    parent!.appendChild(newElement);
}

function createComponent(key: string, data?: string[]): HTMLElement {
    const componentFn = window.components?.[key];
    if (!componentFn) {
        throw `Component function not found for key: ${key}. Is it loaded?`;
    }
    let newElement;
    if (data) {
        newElement = componentFn(...data);
    } else {
        newElement = componentFn();
    }
    return newElement;
}


function loadComponent(componentKey: string): void {
    if (typeof window === 'undefined') return;

    // If the component function is already available, no need to load the script
    if (window.components?.[componentKey]) return;

    // Avoid duplicate script tags
    const scriptSrc = `./${componentKey}.js`;
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.head.appendChild(script);
}

export const runtimeFunctions = [
    { name: "renderComponent", fn: renderComponent },
    { name: "loadComponent", fn: loadComponent },
    { name: "createComponent", fn: createComponent },
];
