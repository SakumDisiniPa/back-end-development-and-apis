const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());

// Trust proxy untuk mendapatkan IP asli jika di belakang proxy
app.set('trust proxy', true);

// API endpoint
app.get('/api/whoami', (req, res) => {
  // Mendapatkan IP address dengan mempertimbangkan berbagai header
  const ipaddress = req.headers['x-forwarded-for']?.split(',')[0] 
                   || req.ip 
                   || req.connection.remoteAddress;
  
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];
  
  res.json({
    ipaddress: ipaddress,
    language: language,
    software: software
  });
});

// Serve static files
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});