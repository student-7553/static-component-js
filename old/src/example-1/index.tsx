import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <div class="app">
      <h1 >Hello from JSX Test!</h1>
      <p>This page was authored in JSX and compiled to static HTML.</p>

      <button onClick={
        {
          event: "render",
          component: "Card1",
          target: "cardContainer"
        }
      }
      >Add component me</button>
      <button onClick={
        {
          event: "function",
          name: "removeComponentHelper",
          data: ["cardContainer"],
        }
      }
      >Remove component</button>

      <button onClick={
        {
          event: "function",
          name: "loadComponentHelper",
        }
      }
      >Load component</button>

      <div id="cardContainer" >

      </div>
    </div >
  );
}
