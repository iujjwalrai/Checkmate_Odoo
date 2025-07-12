const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const { authenticate, isAdmin } = require('../middleware/auth'); 

// GET all users
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all questions
router.get('/questions', authenticate, isAdmin, async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a question by ID
router.delete('/questions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
