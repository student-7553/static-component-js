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
          data: {
            target: "tempoooooo"
          }
        }
      }
      >Add component me</button>
      <button onClick={
        {
          event: "function",
          name: "removeComponentHelper",
          data: {
            parentId: "tempoooooo",
          }
        }
      }
      >Remove component</button>

      <button onClick={
        {
          event: "function",
          name: "loadComponentHelper",
          data: {}
        }
      }
      >Load component</button>

      <button onClick={
        {
          event: "function",
          name: "myCustomFunction",
          data: {
            msg: "Hello from JSX!",
            count: 42
          }
        }
      }>Call Custom Function</button>

      <div id="tempoooooo" >

      </div>
    </div >
  );
}
