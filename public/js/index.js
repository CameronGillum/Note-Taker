document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.querySelector('.note-form');
  const noteTitle = document.querySelector('.note-title');
  const noteText = document.querySelector('.note-textarea');
  const saveNoteBtn = document.querySelector('.save-note');
  const newNoteBtn = document.querySelector('.new-note');
  const clearBtn = document.querySelector('.clear-btn');
  const listGroup = document.querySelector('#list-group');

  // Show an element
  const toggleButtonVisibility = () => {
    if (noteTitle.value.trim() && noteText.value.trim()) {
      saveNoteBtn.style.display = 'inline-block';
      clearBtn.style.display = 'inline-block';
    } else if (noteTitle.value.trim() || noteText.value.trim()) {
      saveNoteBtn.style.display = 'none';
      clearBtn.style.display = 'inline-block';
    } else {
      saveNoteBtn.style.display = 'none';
      clearBtn.style.display = 'none';
    }
  };

  // Save a new note
  const saveNote = () => {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (title && text) {
      const newNote = { title, text };
      fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      })
      .then(response => response.json())
      .then(data => {
        addNewNoteToSidebar(data);
        clearFields();
      })
      .catch(error => {
        console.error('Error saving new note:', error);
      });
    }
  };

  // Clear the form fields
  const clearFields = () => {
    noteTitle.value = '';
    noteText.value = '';
    toggleButtonVisibility();
  };

  // Add a new note to the sidebar
  const addNewNoteToSidebar = (note) => {
    const noteItem = document.createElement('li');
    noteItem.classList.add('list-group-item');
    noteItem.setAttribute('data-note-id', note.id);
    noteItem.innerHTML = `
      <span>${note.title}</span>
      <i class="fas fa-trash-alt float-right text-danger delete-note"></i>
    `;
    listGroup.appendChild(noteItem);
  };

  // Load notes from the server
  const loadNotes = () => {
    fetch('/api/notes')
      .then(response => response.json())
      .then(data => {
        listGroup.innerHTML = ''; // Clear the list before adding notes
        data.forEach(note => addNewNoteToSidebar(note));
      })
      .catch(error => {
        console.error('Error loading notes:', error);
      });
  };

  // Handle note deletion
  listGroup.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-note')) {
      const noteItem = event.target.closest('.list-group-item');
      const noteId = noteItem.getAttribute('data-note-id');
      fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })
      .then(() => {
        noteItem.remove();
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      });
    }
  });

  // Event listeners
  noteTitle.addEventListener('input', toggleButtonVisibility);
  noteText.addEventListener('input', toggleButtonVisibility);
  saveNoteBtn.addEventListener('click', saveNote);
  clearBtn.addEventListener('click', clearFields);

  // Initially hide the buttons
  toggleButtonVisibility();

  loadNotes();
});


let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let clearBtn;

// console.log(noteForm, noteTitle, noteText, saveNoteBtn, newNoteBtn, noteList, clearBtn);

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};


// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);


getAndRenderNotes();