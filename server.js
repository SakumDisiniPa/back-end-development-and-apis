const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Helper function to validate date
function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

// Timestamp API
app.get('/api/:date?', (req, res) => {
  let dateParam = req.params.date;
  let date;

  // Handle no parameter
  if (!dateParam) {
    date = new Date();
    return res.json({
      unix: date.getTime(),
      utc: date.toUTCString()
    });
  }

  // Cek apakah timestamp
  if (/^\d+$/.test(dateParam)) {
    date = new Date(parseInt(dateParam));
  } else {
    date = new Date(dateParam);
  }

  // ❌ Validasi tanggal
  if (!isValidDate(date)) {
    return res.json({ error: "Invalid Date" });
  }

  // ✅ Return valid date
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Serve static files (optional, kalau ada front-end)
app.use(express.static('public'));

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
