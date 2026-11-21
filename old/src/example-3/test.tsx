import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <form action="/form" method="POST">
      <label for="name">Name:</label>
      <input type="text" name="name"></input>

      <label for="address">Address:</label>
      <input type="text" name="address"></input>
      <button type="submit"> Submit</button>
    </form>
  );
}
