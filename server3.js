const express = require('express');
const dns = require('dns');
const { URL } = require('url');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
mongoose.connect('mongodb://localhost:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

// Helper function to validate URL
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

// POST endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  if (!validateUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlObj = new URL(url);
    await new Promise((resolve, reject) => {
      dns.lookup(urlObj.hostname, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if URL already exists
    const existingUrl = await Url.findOne({ original_url: url });
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    // Create new short URL
    const count = await Url.countDocuments();
    const newUrl = new Url({
      original_url: url,
      short_url: count + 1
    });

    await newUrl.save();
    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect short URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const url = await Url.findOne({ short_url: req.params.short_url });
    if (url) {
      return res.redirect(url.original_url);
    }
    res.json({ error: 'No short URL found for the given input' });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});