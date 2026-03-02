import { h } from "../compiler/jsx-compile-time.js";

export default function Task(id: string, taskName: string) {
  return (
    <div id={id}>
      <h1> {taskName} </h1>
      <button
        onClick={
          {
            event: "function",
            name: "deleteTask",
            data: [id]
          }
        }
      >delete</button>
    </div >
  );
}
