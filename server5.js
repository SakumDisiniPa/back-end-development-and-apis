const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());

// Konfigurasi Multer
const upload = multer({ dest: 'uploads/' });

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/MetadataMicroservice.html');
});

// Route untuk handle upload file
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const response = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };

  res.json(response);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});