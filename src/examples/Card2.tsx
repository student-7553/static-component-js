import { h } from "../compiler/jsx-compile-time.js";

let tempo: string = "Card2";

export default function Card2() {
  return (
    <div class="card2">
      <p teempo={tempo}>Card 2</p>
    </div>
  );
}
