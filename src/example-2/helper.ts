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
    console.log(inputElement.value);

    inputElement.value = "";
}