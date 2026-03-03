import { h } from "../compiler/jsx-compile-time.js";

export default function EntryLink(
  url: string,
) {
  return (
    <a style={{ display: "flex", alignItems: "center" }} href={url}>{url}</a>
  );
}
