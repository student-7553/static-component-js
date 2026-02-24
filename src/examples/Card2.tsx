import { h } from "../jsx-runtime.js";


export default function Card2(tempo: string) {
  return (
    <div class="card2">
      <h2 teempo={tempo}>Card2</h2>
      {tempo}
    </div>
  );
}
