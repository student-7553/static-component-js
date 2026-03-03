
export function addNewComponent(componentId: string, key: string) {
    const newElement = (window as any).inner.renderComponent(componentId, key);
    console.log(newElement);
}