import { h, Fragment } from "../jsx-runtime.js";

/**
 * Example JSX component demonstrating the JSX feature set:
 *  - Intrinsic elements (<div>, <h1>, <p>, <button>)
 *  - Nested children
 *  - onClick handler (wired up in window.onload by the compiler)
 *  - class attribute
 *  - A nested function component (<Card />)
 */

interface CardProps {
  title: string;
  body: string;
}

function Card({ title, body }: CardProps) {
  return (
    <div class="card">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}


export default function App() {
  return (
    <div class="app">
      <h1>Hello from JSX Test!</h1>
      <p>This page was authored in JSX and compiled to static HTML.</p>

      <Card
        title="What is this?"
        body="A zero-dependency JSX compiler built on top of Element + Component."
      />

      <button onClick={() => {
        console.log("Button clicked!");
      }}>Click me</button>
    </div>
  );
}
