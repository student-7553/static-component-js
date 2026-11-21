let isTimerStarted = false;

const elements = document.getElementsByClassName("tempo");

for (const element of Array.from(elements)) {

    element.addEventListener("click", (e) => {
        console.log(e, "clicked");
    });
}


// function reset() {
// }