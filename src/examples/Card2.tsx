import { h } from "../compiler/jsx-runtime.js";

let tempo: string = "Arewe here?";
export default function Card2() {
  return (
    <div class="card2">
      <h2 teempo={tempo}>Card2</h2>
      {tempo}
    </div>
  );
}
