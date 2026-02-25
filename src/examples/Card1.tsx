import { h } from "../compiler/jsx-compile-time.js";
import Card2 from "./Card2.js";
import Card4 from "./testd/Card4.js";


function Card3_INNER() {
  return (
    <div class="card3">
      <p> Card 3 </p>
    </div>
  );
}

export default function Card1() {
  return (
    <div class="card1">
      <p> Card 1 </p>
      <Card2 />
      <Card3_INNER />
      <Card4 />
      <p>
        ----------------
      </p>
    </div>
  );
}
