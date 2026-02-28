import { h } from "../compiler/jsx-compile-time.js";

export default function Simple() {
    return (
        <div>
            <h1>Simple Component</h1>
            <p>This component uses no runtime functions.</p>
        </div>
    );
}
