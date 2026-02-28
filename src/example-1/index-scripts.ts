
export function addNewComponent(componentId: string, key: string) {
    const newElement = (window as any)._inner_renderComponent(componentId, key);
    console.log(newElement);
}