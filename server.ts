import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import db from './src/server/db.js';
import { __dirname } from './src/lib/pathUtils.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Audio Uploads Configuration
const audioUploadDir = path.resolve(__dirname, '../../public/audio');
if (!fs.existsSync(audioUploadDir)) {
  fs.mkdirSync(audioUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, audioUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'));
  }
} });

// API Endpoints

// Submit feeling feedback
app.post('/api/feedback', (req, res) => {
  const { result_type, feeling } = req.body;
  if (!result_type || !feeling) {
    // Note: express v5 handles async/promises correctly but we rely on simple res.status here
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  try {
    const stmt = db.prepare('INSERT INTO feedback (result_type, feeling) VALUES (?, ?)');
    const info = stmt.run(result_type, feeling);
    res.json({ id: info.lastInsertRowid, success: true });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Route: Get all feedbacks
app.get('/api/feedback', (req, res) => {
  try {
    const feedbacks = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Route: Upload an MP3 for a specific personality result
app.post('/api/audio/upload', upload.single('audioFile'), (req, res) => {
  if (!req.file) {
     res.status(400).json({ error: 'No file uploaded' });
     return;
  }
  const resultType = req.body.resultType; // e.g., 'energy', 'space', 'texture'
  const filename = req.file.filename;

  try {
    const stmt = db.prepare('INSERT INTO generated_audio (result_type, filename) VALUES (?, ?)');
    stmt.run(resultType, filename);
    res.json({ success: true, filename });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get available audio files for a personality result type
app.get('/api/audio/track/:resultType', (req, res) => {
  try {
    const row = db.prepare('SELECT filename FROM generated_audio WHERE result_type = ? ORDER BY id DESC LIMIT 1').get(req.params.resultType);
    if (row && (row as any).filename) {
      res.json({ filename: (row as any).filename });
    } else {
      res.json({ filename: null });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/audio/all', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM generated_audio ORDER BY id DESC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});


app.use('/audio', express.static(audioUploadDir));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
