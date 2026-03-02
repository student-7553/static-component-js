import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <div>
      <div id="jobBoardContainer">
      </div>
      <button id="loadMoreBtn" onClick={{
        event: "function",
        name: "loadJobBoard"
      }}>Load more</button>
    </div>
  );
}
