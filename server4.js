const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing application/json
app.use(express.urlencoded({ extended: true })); 

// Serve static files (like index.html)
app.use(express.static('public'));

// Database setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ubah ke ObjectId
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const user = new User({ username });
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    // Handle duplicate username error (MongoDB error code 11000)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id'); // Select only username and _id
    res.json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  try {
    // Validate user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate exercise data
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration)) {
      return res.status(400).json({ error: 'Duration must be a number' });
    }

    // Parse date or use current date, with validation
    let exerciseDate;
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      exerciseDate = parsedDate;
    } else {
      exerciseDate = new Date();
    }

    // Create exercise
    const exercise = new Exercise({
      userId: _id,
      description,
      duration: parsedDuration,
      date: exerciseDate
    });

    const savedExercise = await exercise.save();

    // Return user with exercise data, formatted as required
    res.json({
      _id: user._id,
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString() // Ensure date is formatted here
    });
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    // 1. Cari user terlebih dahulu
    const user = await User.findById(_id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Buat query untuk exercise
    const exerciseQuery = { userId: _id };
    const dateFilter = {};

    // Filter tanggal
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        dateFilter.$gte = fromDate;
      } else {
        return res.status(400).json({ error: 'Invalid "from" date format' });
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        dateFilter.$lte = toDate;
      } else {
        return res.status(400).json({ error: 'Invalid "to" date format' });
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      exerciseQuery.date = dateFilter;
    }

    // 3. Ambil data exercise
    let exercises = await Exercise.find(exerciseQuery)
      .select('description duration date -_id')
      .lean();

    // Apply limit if provided
    if (limit) {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        exercises = exercises.slice(0, parsedLimit);
      }
    }

    // 4. Format data exercise
    const log = exercises.map(ex => {
      const exerciseDate = new Date(ex.date);
      let formattedDate;
      if (isNaN(exerciseDate.getTime())) {
        formattedDate = "Invalid Date"; // Fallback
      } else {
        formattedDate = exerciseDate.toDateString();
      }
      return {
        description: ex.description,
        duration: ex.duration,
        date: formattedDate
      };
    });

    // 5. Bangun response sesuai format freeCodeCamp
    const response = {
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log,
    };

    // 6. Kirim response
    res.json(response);

  } catch (err) {
    console.error('Error getting exercise log:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});