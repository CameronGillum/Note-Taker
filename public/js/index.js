document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.querySelector('.note-form');
  const noteTitle = document.querySelector('.note-title');
  const noteText = document.querySelector('.note-textarea');
  const saveNoteBtn = document.querySelector('.save-note');
  const newNoteBtn = document.querySelector('.new-note');
  const clearBtn = document.querySelector('.clear-btn');
  const listGroup = document.querySelector('#list-group');
  let currentNote = null;

  // Show or hide buttons based on input
  const toggleButtonVisibility = () => {
    if (currentNote) {
      clearBtn.style.display = 'none';
      saveNoteBtn.style.display = 'none';
    } else if (noteTitle.value.trim() && noteText.value.trim()) {
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
      const noteData = { title, text };
      const url = currentNote ? `/api/notes/${currentNote.id}` : '/api/notes';
      const method = currentNote ? 'PUT' : 'POST';

      console.log(`Saving note. URL: ${url}, Method: ${method}, Data:`, noteData);

      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Note saved successfully:', data);
        if (currentNote) {
          // Update the existing note in the sidebar
          updateNoteInSidebar(data);
        } else {
          // Add a new note to the sidebar
          addNewNoteToSidebar(data);
        }
        clearFields();
        newNoteBtn.style.display = 'inline-block';
      })
      .catch(error => {
        console.error('Error saving note:', error);
      });
    }
  };

  // Clear the form fields
  const clearFields = () => {
    noteTitle.value = '';
    noteText.value = '';
    toggleButtonVisibility();
    console.log('Fields cleared.');
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
    console.log('Note added to sidebar:', note);
  };

  // Update an existing note in the sidebar
  const updateNoteInSidebar = (note) => {
    const noteItem = listGroup.querySelector(`[data-note-id="${note.id}"]`);
    if (noteItem) {
      noteItem.querySelector('span').textContent = note.title;
      console.log('Note updated in sidebar:', note);
    }
  };

  // Load notes from the server
  const loadNotes = () => {
    fetch('/api/notes')
      .then(response => response.json())
      .then(data => {
        listGroup.innerHTML = ''; // Clear the list before adding notes
        data.forEach(note => addNewNoteToSidebar(note));
        console.log('Notes loaded:', data);
      })
      .catch(error => {
        console.error('Error loading notes:', error);
      });
  };

  // Handle note selection
  listGroup.addEventListener('click', (event) => {
    console.log('Clicked on listGroup:', event.target);
    const noteItem = event.target.closest('.list-group-item');
    if (noteItem) {
      const noteId = noteItem.getAttribute('data-note-id');
      console.log(`Fetching note with ID: ${noteId}`);
  
      fetch(`/api/notes/${noteId}`)
        .then(response => {
          if (!response.ok) {
            // Log the status and text of the response if it's not OK
            console.error(`Network response was not ok. Status: ${response.status}`);
            return response.text().then(text => { throw new Error(text); });
          }
          return response.json().catch(err => {
            // Handle JSON parsing errors
            console.error('Error parsing JSON:', err);
            return response.text(); // Fallback to text if JSON parsing fails
          });
        })
        .then(data => {
          // If data is text, log it and handle it accordingly
          if (typeof data === 'string') {
            console.error('Received unexpected response:', data);
          } else {
            console.log('Note fetched:', data);
            noteTitle.value = data.title;
            noteText.value = data.text;
            currentNote = data;
            toggleButtonVisibility();
            newNoteBtn.style.display = 'inline-block';
          }
        })
        .catch(error => {
          // Log the error message and stack trace
          console.error('Error fetching note:', error.message);
          console.error(error.stack);
        });
    }
  });

  // Handle note deletion
  listGroup.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-note')) {
      const noteItem = event.target.closest('.list-group-item');
      const noteId = noteItem.getAttribute('data-note-id');
      console.log(`Deleting note with ID: ${noteId}`);

      fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })
      .then(() => {
        noteItem.remove();
        clearFields();
        newNoteBtn.style.display = 'none';
        currentNote = null; // Clear current note reference
        console.log('Note deleted.');
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      });
    }
  });

  // Handle new note button
  newNoteBtn.addEventListener('click', () => {
    clearFields();
    currentNote = null;
    newNoteBtn.style.display = 'none';
  });

  // Event listeners
  noteTitle.addEventListener('input', toggleButtonVisibility);
  noteText.addEventListener('input', toggleButtonVisibility);
  saveNoteBtn.addEventListener('click', saveNote);
  clearBtn.addEventListener('click', clearFields);

  // Initially hide the buttons
  toggleButtonVisibility();

  // Load notes on page load
  loadNotes();
});