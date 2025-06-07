import { useState } from "react";
import "@picocss/pico";
import "./App.css";

function App() {
  return (
    <main className="container">
      <h1 className="app-title">Note App</h1>
      <div className="note-list">
        <article className="note-item">
          <div className="note-title">My first note</div>
        </article>

        <article className="note-item">
          <div className="note-title">My second note</div>
        </article>
      </div>

      <br />

      <label htmlFor="note-title">
        Title
        <input id="note-title" placeholder="Title of the note" required></input>
      </label>

      <label htmlFor="note-content">
        Content
        <textarea
          id="note-content"
          placeholder="The content"
          required
        ></textarea>
      </label>
      <button type="button">Submit</button>
    </main>
  );
}

export default App;
