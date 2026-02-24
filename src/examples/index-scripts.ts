
export function addNewComponent() {
    const newElement = (window as any).renderComponent("Card2");
    console.log(newElement);
}