import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <div class="app">
      <h1 >Sample task</h1>

      <input id="baseInput" type="text" />

      <button onClick={
        {
          event: "function",
          name: "addTask",
        }
      }
      >Add component me</button>

    </div >
  );
}
