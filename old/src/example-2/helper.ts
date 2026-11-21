function getInputElement() {
    if ((window as any).customCache !== 'undefined') {
        (window as any).customCache = {};
    }

    let inputElement = (window as any).customCache["input"];
    if (!inputElement) {
        inputElement = document.getElementById("baseInput");
        (window as any).customCache["input"] = inputElement;
    }

    return inputElement;
}

let counter = 0;

export function addTask() {
    const inputElement = getInputElement();
    (window as any).inner.renderComponent("Task", "taskList", [counter, inputElement.value]);
    inputElement.value = "";
    counter++;
}

export function deleteTask(id: string) {
    const chosenElement: HTMLElement | null = document.getElementById(id);
    if (!chosenElement) {
        console.error("Element not found");
        return;
    }
    chosenElement.remove()
}