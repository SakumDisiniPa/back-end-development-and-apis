const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
mongoose.connect('mongodb://localhost:27017/exercisetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);

// Exercise Schema
const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Create new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;

  try {
    const user = new User({ username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
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
    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' });
    }

    // Parse date or use current date
    const exerciseDate = date ? new Date(date) : new Date();

    // Create exercise
    const exercise = new Exercise({
      userId: _id,
      description,
      duration: parseInt(duration),
      date: exerciseDate
    });

    await exercise.save();

    // Return user with exercise data
    res.json({
      _id: user._id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    });
  } catch (err) {
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
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    if (Object.keys(dateFilter).length > 0) {
      exerciseQuery.date = dateFilter;
    }

    // 3. Ambil data exercise
    let exercises = await Exercise.find(exerciseQuery)
      .select('description duration date -_id')
      .lean();

    if (limit) {
      exercises = exercises.slice(0, parseInt(limit));
    }

    // 4. Format data exercise
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: new Date(ex.date).toDateString()
    }));

    // 5. Bangun response dengan urutan yang tepat
    const response = {
      _id: user._id,
      username: user.username
    };

    if (from) response.from = new Date(from).toDateString();
    if (to) response.to = new Date(to).toDateString();

    response.count = log.length;
    response.log = log;

    // 6. Kirim response
    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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