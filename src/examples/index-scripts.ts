
export function addNewComponent(componentId: string, key: string) {
    const newElement = (window as any).renderComponent(componentId, key);
    console.log(newElement);
}