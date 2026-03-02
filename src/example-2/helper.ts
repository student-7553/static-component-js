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

export function addTask() {
    const inputElement = getInputElement();
    (window as any)._inner_renderComponent("Task", "taskList", inputElement.value);
    inputElement.value = "";
}

export function deleteTask(taskName: string) {
    // const inputElement = getInputElement();
    const chosenElement = document.getElementById(taskName);
    if (!chosenElement) {
        console.error("Test are we called...");
    }
    // (window as any)._inner_renderComponent("Task", "taskList", inputElement.value);
    // inputElement.value = "";
}