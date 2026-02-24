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