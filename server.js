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

// API endpoint
app.get('/api/:date', (req, res) => {
  let dateParam = req.params.date;
  let date;

  // Handle empty date parameter
  if (dateParam === 'current' || !dateParam) {
    date = new Date();
    return res.json({
      unix: date.getTime(),
      utc: date.toUTCString()
    });
  }

  // Check if it's a Unix timestamp (number string)
  if (/^\d+$/.test(dateParam)) {
    date = new Date(parseInt(dateParam));
  } else {
    // Try parsing as ISO string or other date string
    date = new Date(dateParam);
  }

  // Validate the date
  if (!isValidDate(date)) {
    return res.json({ error: "Invalid Date" });
  }

  // Return successful response
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Route khusus untuk handle case tanpa parameter date
app.get('/api', (req, res) => {
  const date = new Date();
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Serve static files
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});