import { h } from "../compiler/jsx-compile-time.js";

export default function Entry(
  id: number,
  title: string,
  type: string,
  by?: string,
) {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <p>{id}</p>
      <p>{title}</p>
      <p>{type}</p>
      <p>{by}</p>
    </div>
  );
}
