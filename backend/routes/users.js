const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get current user's profile (authenticated)
router.get('/profile', authenticate, async (req, res) => {
  try {
    console.log('Users: Profile request from user:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('Users: User not found for ID:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Users: Returning profile for user:', user.username);
    res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Users: Error in profile route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });
    
    // Calculate total votes received
    const questions = await Question.find({ author: user._id });
    const answers = await Answer.find({ author: user._id });
    
    const questionVotes = questions.reduce((sum, q) => sum + (q.voteCount || 0), 0);
    const answerVotes = answers.reduce((sum, a) => sum + (a.voteCount || 0), 0);
    const totalVotes = questionVotes + answerVotes;

    res.json({
      user,
      stats: {
        totalQuestions,
        totalAnswers,
        totalVotes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's questions
router.get('/:username/questions', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const questions = await Question.find({ author: user._id })
      .populate('author', 'username avatar reputation')
      .populate('tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalQuestions = await Question.countDocuments({ author: user._id });

    res.json({
      questions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalQuestions / limitNum),
        totalQuestions,
        hasMore: pageNum < Math.ceil(totalQuestions / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's answers
router.get('/:username/answers', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const answers = await Answer.find({ author: user._id })
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'question',
        select: 'title _id'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalAnswers = await Answer.countDocuments({ author: user._id });

    res.json({
      answers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalAnswers / limitNum),
        totalAnswers,
        hasMore: pageNum < Math.ceil(totalAnswers / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (authenticated users can only update their own profile)
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, avatar, bio } = req.body;
    
    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, avatar, bio },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 