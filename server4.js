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

// Get exercise log - FINAL FIX FOR REQUIREMENT #15
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build query
    const query = { userId: _id };
    const dateFilter = {};

    if (from) {
      dateFilter.$gte = new Date(from);
    }
    if (to) {
      dateFilter.$lte = new Date(to);
    }
    if (from || to) {
      query.date = dateFilter;
    }

    let exercisesQuery = Exercise.find(query)
      .select('description duration date -_id');

    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit));
    }

    const exercises = await exercisesQuery.exec();

    // CRITICAL FIX: Ensure date is properly formatted as string
    const formattedExercises = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: new Date(ex.date).toDateString() // EXACT FORMAT REQUIRED
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: formattedExercises.length,
      log: formattedExercises
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/ExerciseTracker.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});