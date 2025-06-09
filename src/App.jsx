import { useState, useEffect, useRef, useCallback } from "react";
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

function useDebounceFn(fn, delay = 1000) {
  const timeout = useRef(null);
  return (...args) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// 1. value = "", debouncedValue = ""
// 2. value = "a", debouncedValue = "" -> timeout1 (() => setDebouncedValue("a"))
// --500ms
// 3. value = "ab", debouncedValue = "" -> clearTimeout(timeout1), timeout2 (() => setDebouncedValue("ab"))
// --1000ms () => setDebouncedValue("ab")
// 4. value = "ab", debouncedValue = "ab"
function useDebounceValue(value, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);

  return debouncedValue;
}

// history: [3, 2, 1]
// current: 4
// future:  []

function App() {
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [noteData, setNoteData] = useState(null); // update form (title, content)
  const [notes, setNotes] = useState(() => {
    const initialNote = localStorage.getItem("notes");
    return JSON.parse(initialNote) ?? [];
  }); // database

  const [deletingItem, setDeletingItem] = useState(null);

  const debouncedNotes = useDebounceValue(notes, 3000);
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(debouncedNotes));
  }, [debouncedNotes]);

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

  const saveNote = useCallback(
    (newData) => {
      const isExisted = notes.find((note) => note.id === newData.id);
      if (isExisted) {
        setNotes(
          notes.map((item) => {
            if (item.id === newData.id) {
              return newData;
            }
            return item;
          })
        );
      } else {
        setNotes([...notes, newData]);
      }
    },
    [notes]
  );

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "z" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (event.shiftKey) {
          // redo
          const lastNote = future[0];
          if (lastNote) {
            setHistory([noteData, ...history]);
            setNoteData(lastNote);
            saveNote(lastNote);
            setFuture(future.slice(1));
          }
        } else {
          // undo
          const previousNote = history[0];
          if (previousNote) {
            setHistory(history.slice(1));
            setNoteData(previousNote);
            saveNote(previousNote);
            setFuture([noteData, ...future]);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [future, history, noteData, saveNote]);

  /**
   * This function lets you define a field to update with a value
   */
  const updateField = (field, value) => {
    if (noteData.id) {
      // update the note
      const newData = {
        ...noteData,
        [field]: value,
      };
      saveNote(newData);
      setNoteData(newData);
      setHistory([noteData, ...history]);
    } else {
      // create a new note, uuid v4
      const newId = Date.now();
      const newData = {
        ...noteData,
        [field]: value,
        id: newId,
      };
      saveNote(newData);
      setNoteData(newData);
      setHistory([noteData, ...history]);
    }
  };

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 className="app-title">Note App</h1>
        <button
          style={{ width: "auto" }}
          onClick={() => {
            setNoteData({ title: "", content: "" });
          }}
        >
          📝
        </button>
      </div>
      <div className="note-list">
        {notes.map((note) => {
          return (
            <NoteWidget
              key={note.id}
              note={note}
              editing={note.id === noteData?.id}
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

      {noteData && (
        <>
          <label htmlFor="note-title">
            Title
            <input
              id="note-title"
              placeholder="Title of the note"
              required
              value={noteData.title}
              onChange={(event) => {
                updateField("title", event.target.value);
              }}
            ></input>
          </label>

          <label htmlFor="note-content">
            Content
            <textarea
              id="note-content"
              placeholder="The content"
              required
              value={noteData.content}
              onChange={(event) => {
                updateField("content", event.target.value);
              }}
            ></textarea>
          </label>

          <div style={{ display: "flex", gap: 16 }}>
            <button
              style={{ width: "auto" }}
              disabled={history.length === 0}
              onClick={() => {
                const previousNote = history[0];
                if (previousNote) {
                  setHistory(history.slice(1));
                  setNoteData(previousNote);
                  saveNote(previousNote);
                  setFuture([noteData, ...future]);
                }
              }}
            >
              Undo
            </button>
            <button
              style={{ width: "auto" }}
              disabled={future.length === 0}
              onClick={() => {
                const lastNote = future[0];
                if (lastNote) {
                  setHistory([noteData, ...history]);
                  setNoteData(lastNote);
                  saveNote(lastNote);
                  setFuture(future.slice(1));
                }
              }}
            >
              Redo
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
