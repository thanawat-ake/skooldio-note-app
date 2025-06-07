import { useState } from "react";
import "@picocss/pico";

function App() {
  return (
    <main className="container">
      <h1 style={{ marginBottom: "1rem" }}>My notes</h1>

      <div style={{ display: "flex", gap: "1rem" }}>
        <article style={{ margin: 0 }}>
          <div>Note 1</div>
        </article>
        <article style={{ margin: 0 }}>
          <div>Note 2</div>
        </article>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label htmlFor="title">
          Title
          <input
            type="text"
            id="title"
            name="title"
            placeholder="The note's title"
            required
          />
        </label>

        <label htmlFor="content">
          Content
          <textarea type="text" id="content" name="content" required />
        </label>

        <button type="button">Save</button>
      </div>
    </main>
  );
}

export default App;
