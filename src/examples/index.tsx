import { h } from "../compiler/jsx-compile-time.js";
import Card2 from "./Card2.js";


interface CardProps {
  title: string;
  body: string;
}

function Card({ title, body }: CardProps) {
  return (
    <div class="card" style={{
      color: "blue",
      fontSize: "20px"
    }}>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

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
