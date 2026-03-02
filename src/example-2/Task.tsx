import { h } from "../compiler/jsx-compile-time.js";

export default function Task(taskName: string) {
  return (
    <div id={taskName}>
      <h1> {taskName} </h1>
      <button
        onClick={
          {
            event: "function",
            name: "deleteTask",
            data: {
              taskName: taskName
            }
          }
        }
      >delete</button>
    </div >
  );
}
