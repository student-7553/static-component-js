export function getValue(key: string) {
    if (typeof window == 'undefined') {
        return null;
    }
    if (!(window as any)?.kv[key]) {
        return null;
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

// what are the ways I can rerender the components