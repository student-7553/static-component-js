"use strict";

const PAGE_SIZE = 6;
let currentPage = 0;
let allJobIds: number[] = [];

let isLoaded = false;
let loadPromise = new Promise<void>((resolve) => {
    if (typeof window !== "undefined") {
        (window as any).addEventListener("DOMContentLoaded", () => {
            isLoaded = true;
            resolve();
        });
    }
});

function formatTimestamp(unixSeconds: number): string {
    const date = new Date(unixSeconds * 1000);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface JobItem {
    id: number;
    title: string;
    by?: string;
    time?: number;
    url?: string;
    type: string;
}

// function renderJobCard(job: JobItem): HTMLElement {
//     const card = document.createElement("div");
//     card.className = "job-card";
//     const titleEl = document.createElement("div");
//     titleEl.className = "job-title";
//     if (job.url) {
//         const link = document.createElement("a");
//         link.href = job.url;
//         link.target = "_blank";
//         link.rel = "noopener noreferrer";
//         link.textContent = job.title;
//         titleEl.appendChild(link);
//     } else {
//         titleEl.textContent = job.title;
//     }
//     card.appendChild(titleEl);
//     const meta = document.createElement("div");
//     meta.className = "job-meta";
//     if (job.by) {
//         const author = document.createElement("span");
//         author.className = "job-author";
//         author.textContent = `by ${job.by}`;
//         meta.appendChild(author);
//     }
//     if (job.time) {
//         const timeEl = document.createElement("span");
//         timeEl.className = "job-time";
//         timeEl.textContent = formatTimestamp(job.time);
//         meta.appendChild(timeEl);
//     }
//     if (meta.hasChildNodes()) {
//         card.appendChild(meta);
//     }
//     return card;
// }

function updateLoadMoreButton(): void {
    const btn = document.getElementById("loadMoreBtn") as HTMLButtonElement | null;
    if (!btn) return;
    const nextPageStart = (currentPage + 1) * PAGE_SIZE;
    if (nextPageStart >= allJobIds.length) {
        btn.style.display = "none";
    } else {
        btn.style.display = "";
    }
}

async function loadEntries(page: number): Promise<void> {

    const container = document.getElementById("jobBoardContainer");
    if (!container) return;

    // Fetch job IDs on first load
    if (allJobIds.length === 0) {
        const res = await Promise.all([fetch("https://hacker-news.firebaseio.com/v0/jobstories.json"), loadPromise]);
        allJobIds = await res[0].json() as number[];
    }

    const start = page * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, allJobIds.length);
    const pageIds = allJobIds.slice(start, end);

    // Fetch all job details in parallel
    const jobs = await Promise.all(
        pageIds.map(async (id) => {
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            return res.json() as Promise<JobItem>;
        })
    );
    const containerElement = document.getElementById("jobBoardContainer");
    if (!containerElement) {
        throw "containerElement missing";
    }

    for (const job of jobs) {
        if (job && job.title) {
            const newElement = window.inner.createComponent("Entry", [job.id, job.title, job.type, job.by]);
            if (job.time) {
                const formattedTime = formatTimestamp(job.time);
                const linkElement = window.inner.createComponent("EntryTime", [formattedTime]);
                newElement.append(linkElement);
            }
            if (job.url) {
                const linkElement = window.inner.createComponent("EntryLink", [job.url]);
                newElement.append(linkElement);
            }
            containerElement.append(newElement);
        }
    }

    updateLoadMoreButton();
}

function loadJobBoard(): void {
    currentPage += 1;
    loadEntries(currentPage);
}

loadEntries(0);
