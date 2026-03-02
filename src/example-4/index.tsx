import { h } from "../compiler/jsx-compile-time.js";

export default function App() {
  return (
    <div>
      <div>
        <button onClick={{
          event: "function",
          name: "clickTab",
          data: ["HTML"]
        }
        }>HTML</button>
        <button onClick={{
          event: "function",
          name: "clickTab",
          data: ["CSS"]
        }
        }>CSS</button>
        <button onClick={{
          event: "function",
          name: "clickTab",
          data: ["JavaScript"]
        }
        }>JavaScript</button>
      </div>
      <div>
        <p id="HTML" style={{ display: "block" }} >
          The HyperText Markup Language or HTML is the
          standard markup language for documents designed to
          be displayed in a web browser.
        </p>

        <p id="CSS" style={{ display: "none" }}>
          Cascading Style Sheets is a style sheet language
          used for describing the presentation of a document
          written in a markup language such as HTML or XML.
        </p>
        <p id="JavaScript" style={{ display: "none" }}>
          JavaScript, often abbreviated as JS, is a
          programming language that is one of the core
          technologies of the World Wide Web, alongside HTML
          and CSS.
        </p>
      </div>
    </div>
  );
}
