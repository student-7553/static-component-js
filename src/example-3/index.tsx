import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <div class="app">
      <form action="/test" method="POST">
        <label for="name" >
          Name:
        </label>
        <input type="text" name="name" />

        <label for="tempo" >
          Tempo:
        </label>
        <input type="text" name="tempo" />

        <input type="submit" value="Submit" />
      </form>
    </div >
  );
}
