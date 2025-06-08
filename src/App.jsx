import { useState, useEffect } from "react";
import "@picocss/pico";
import "./App.css";

function NoteWidget({ note, editing, onEditNote, onDeleteNote }) {
  return (
    <article
      className={`note-item ${editing ? "note-editing" : ""}`}
      key={note.id}
    >
      <div className="note-title">{note.title}</div>
      <button
        className="note-edit-button"
        onClick={() => {
          // onEditNote?.(note);
          if (onEditNote) {
            onEditNote();
          }
        }}
      >
        📝
      </button>
      <button
        className="note-delete-button"
        onClick={() => {
          onDeleteNote?.();
        }}
      >
        🚮
      </button>
    </article>
  );
}

function App() {
  const [noteData, setNoteData] = useState({ title: "", content: "" });

  const [notes, setNotes] = useState(() => {
    const initialNote = localStorage.getItem("notes");
    return JSON.parse(initialNote) ?? [];
  });

  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key === "notes") {
        setNotes(JSON.parse(event.newValue) ?? []);
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <main className="container">
      <h1 className="app-title">Note App</h1>
      <div className="note-list">
        {notes.map((note) => {
          return (
            <NoteWidget
              key={note.id}
              note={note}
              editing={note.id === noteData.id}
              onEditNote={() => {
                setNoteData(note);
              }}
              onDeleteNote={() => {
                setDeletingItem(note);
              }}
            />
          );
        })}
      </div>

      {deletingItem && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-title">Are you sure?</div>
            <p>
              To delete {deletingItem.title} note, click the submit button
              below.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setNotes(notes.filter((item) => item.id !== deletingItem.id));
                  setDeletingItem(null);
                }}
              >
                Submit
              </button>
              <button onClick={() => setDeletingItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <br />

      <label htmlFor="note-title">
        Title
        <input
          id="note-title"
          placeholder="Title of the note"
          required
          value={noteData.title}
          onChange={(event) =>
            setNoteData({ ...noteData, title: event.target.value })
          }
        ></input>
      </label>

      <label htmlFor="note-content">
        Content
        <textarea
          id="note-content"
          placeholder="The content"
          required
          value={noteData.content}
          onChange={(event) =>
            setNoteData({ ...noteData, content: event.target.value })
          }
        ></textarea>
      </label>
      <button
        onClick={() => {
          // save the title and content to notes
          if (noteData.id) {
            console.log("1");
            // save to the existing note
            setNotes(
              notes.map((item) => {
                if (item.id === noteData.id) {
                  return noteData;
                }
                return item;
              })
            );
          } else {
            console.log("2");
            // add new note to the list
            // uuid v4
            setNotes([...notes, { ...noteData, id: Date.now() }]);
          }

          setNoteData({ title: "", content: "" });
        }}
      >
        Submit
      </button>
    </main>
  );
}

export default App;
