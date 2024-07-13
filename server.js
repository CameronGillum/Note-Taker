const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server Error');
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
        console.error(err);
        res.status(500).send('Server Error');
        } else {
        const notes = JSON.parse(data);
        const newNote = req.body;
        newNote.id = notes.length + 1;
        notes.push(newNote);
    
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
            if (err) {
            console.error(err);
            res.status(500).send('Server Error');
            } else {
            res.json(newNote);
            }
        });
        }
    });
    }
);

app.delete('/api/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
        console.error(err);
        res.status(500).send('Server Error');
        } else {
        const notes = JSON.parse(data);
        const newNotes = notes.filter((note) => note.id !== id);
    
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(newNotes), (err) => {
            if (err) {
            console.error(err);
            res.status(500).send('Server Error');
            } else {
            res.send('Note deleted');
            }
        });
        }
    });
    }
);

// HTML routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
    }
);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
    }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}
);