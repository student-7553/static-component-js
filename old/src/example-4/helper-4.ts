"use strict"

enum TabName {
    HTML = "HTML",
    CSS = "CSS",
    JavaScript = "JavaScript"
}

let currentActiveTab = TabName.HTML;

function disableTab(tabName: TabName) {
    const element = document.getElementById(tabName);
    if (!element) {
        console.error("Tab not found:" + tabName);
        return;
    }
    element.style.display = "none";
}

function enableTab(tabName: TabName) {
    const element = document.getElementById(tabName);
    if (!element) {
        console.error("Tab not found:" + tabName);
        return;
    }
    element.style.display = "block";
}

function clickTab(tabName: TabName) {
    if (currentActiveTab == tabName) {
        return;
    }

    disableTab(currentActiveTab);
    enableTab(tabName);

    currentActiveTab = tabName;
}
