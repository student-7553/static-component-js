import { h } from "../compiler/jsx-compile-time.js";
import Card2 from "./Card2.js";
import { getValue } from "./helper.js";
import { addNewComponent } from "./index-scripts.js";


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
    <div id="tempoooooo" class="app">
      <h1 >Hello from JSX Test!</h1>
      <p>This page was authored in JSX and compiled to static HTML.</p>

      <Card
        title="What is this?"
        body="A zero-dependency JSX compiler built on top of Element + Component."
      />

      <Card2 />

      <button onClick={
        () => {
          addNewComponent("Card1", "tempoooooo");
        }
      }
      >Click me</button>
    </div >
  );
}
