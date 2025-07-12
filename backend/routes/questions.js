const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get all questions with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      tags, 
      search, 
      sort = 'newest' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build match conditions
    const matchConditions = {};
    
    if (search) {
      matchConditions.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      const tagIds = await Tag.find({ name: { $in: tagArray } }).distinct('_id');
      matchConditions.tags = { $in: tagIds };
    }
    
    // Build sort conditions
    let sortConditions = {};
    switch (sort) {
      case 'newest':
        sortConditions = { createdAt: -1 };
        break;
      case 'oldest':
        sortConditions = { createdAt: 1 };
        break;
      case 'votes':
        sortConditions = { voteCount: -1 };
        break;
      case 'views':
        sortConditions = { views: -1 };
        break;
      default:
        sortConditions = { createdAt: -1 };
    }
    
    // Aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            { $project: { username: 1, avatar: 1, reputation: 1 } }
          ]
        }
      },
      { $unwind: '$author' },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      { $sort: sortConditions },
      { $skip: skip },
      { $limit: limitNum }
    ];
    
    const questions = await Question.aggregate(pipeline);
    const totalQuestions = await Question.countDocuments(matchConditions);
    
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

// Place all specific routes BEFORE the /:id route

// Get user's own questions
router.get('/my-questions', authenticate, async (req, res) => {
  try {
    console.log('Backend: /my-questions called for user:', req.user._id);
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort conditions
    let sortConditions = {};
    switch (sort) {
      case 'newest':
        sortConditions = { createdAt: -1 };
        break;
      case 'oldest':
        sortConditions = { createdAt: 1 };
        break;
      case 'votes':
        sortConditions = { voteCount: -1 };
        break;
      case 'views':
        sortConditions = { views: -1 };
        break;
      default:
        sortConditions = { createdAt: -1 };
    }
    
    // Aggregation pipeline for user's questions
    console.log('Backend: User ID type:', typeof req.user._id);
    console.log('Backend: User ID value:', req.user._id);
    
    const pipeline = [
      { $match: { author: req.user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            { $project: { username: 1, avatar: 1, reputation: 1 } }
          ]
        }
      },
      { $unwind: '$author' },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      { $sort: sortConditions },
      { $skip: skip },
      { $limit: limitNum }
    ];
    
    // Test: Check if we can find any questions at all
    const allQuestions = await Question.find({});
    console.log('Backend: Total questions in database:', allQuestions.length);
    
    // Try simple find first
    const simpleQuestions = await Question.find({ author: req.user._id });
    console.log('Backend: Simple find questions count:', simpleQuestions.length);
    
    const questions = await Question.aggregate(pipeline);
    const totalQuestions = await Question.countDocuments({ author: req.user._id });
    
    console.log('Backend: Found', questions.length, 'questions for user');
    console.log('Backend: Total questions for user:', totalQuestions);
    
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

// Get user's activity (questions and answers)
router.get('/my-activity', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get user's questions
    const questions = await Question.find({ author: req.user._id })
      .populate('author', 'username avatar reputation')
      .populate('tags')
      .sort({ createdAt: -1 })
      .limit(limitNum / 2);
    
    // Get user's answers
    const answers = await Answer.find({ author: req.user._id })
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'question',
        select: 'title _id'
      })
      .sort({ createdAt: -1 })
      .limit(limitNum / 2);
    
    // Combine and sort by date
    const activity = [...questions, ...answers].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, limitNum);
    
    const totalQuestions = await Question.countDocuments({ author: req.user._id });
    const totalAnswers = await Answer.countDocuments({ author: req.user._id });
    
    res.json({
      activity,
      stats: {
        totalQuestions,
        totalAnswers,
        totalActivity: totalQuestions + totalAnswers
      },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil((totalQuestions + totalAnswers) / limitNum),
        totalActivity: totalQuestions + totalAnswers,
        hasMore: pageNum < Math.ceil((totalQuestions + totalAnswers) / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route to check authentication
router.get('/test-auth', authenticate, async (req, res) => {
  try {
    console.log('Backend: Test auth route called for user:', req.user._id);
    res.json({ 
      message: 'Authentication working', 
      userId: req.user._id,
      username: req.user.username 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple test route without authentication
router.get('/test', async (req, res) => {
  try {
    console.log('Backend: Simple test route called');
    res.json({ message: 'Backend is working!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get question by ID (this should be LAST)
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate('tags')
      .populate('acceptedAnswer');
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Increment view count
    question.views += 1;
    await question.save();
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new question
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // Find or create tags
    const tagIds = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({ name: tagName.toLowerCase() });
          await tag.save();
        }
        tagIds.push(tag._id);
        
        // Increment question count
        tag.questionCount += 1;
        await tag.save();
      }
    }
    
    // Create question
    console.log('Backend: Creating question for user:', req.user._id);
    const question = new Question({
      title,
      description,
      author: req.user._id,
      tags: tagIds
    });
    
    await question.save();
    console.log('Backend: Question created with ID:', question._id);
    
    // Populate and return
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username avatar reputation')
      .populate('tags');
    
    res.status(201).json({
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update question
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own questions' });
    }
    
    // Update tags if provided
    if (tags) {
      // Decrement count for old tags
      for (const oldTagId of question.tags) {
        await Tag.findByIdAndUpdate(oldTagId, { $inc: { questionCount: -1 } });
      }
      
      // Find or create new tags
      const tagIds = [];
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({ name: tagName.toLowerCase() });
          await tag.save();
        }
        tagIds.push(tag._id);
        
        // Increment question count
        tag.questionCount += 1;
        await tag.save();
      }
      
      question.tags = tagIds;
    }
    
    // Update other fields
    if (title) question.title = title;
    if (description) question.description = description;
    
    await question.save();
    
    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'username avatar reputation')
      .populate('tags');
    
    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete question
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own questions' });
    }
    
    // Delete associated answers
    await Answer.deleteMany({ question: question._id });
    
    // Decrement tag counts
    for (const tagId of question.tags) {
      await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: -1 } });
    }
    
    await Question.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on question
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user already voted
    const existingVoteIndex = question.votes.findIndex(
      vote => vote.user.toString() === req.user._id.toString()
    );
    
    let action = '';
    
    if (existingVoteIndex !== -1) {
      const existingVote = question.votes[existingVoteIndex];
      
      if (existingVote.voteType === voteType) {
        // Remove vote
        question.votes.splice(existingVoteIndex, 1);
        action = 'removed';
      } else {
        // Change vote
        question.votes[existingVoteIndex].voteType = voteType;
        action = 'changed';
      }
    } else {
      // Add new vote
      question.votes.push({ user: req.user._id, voteType });
      action = 'added';
    }
    
    // Calculate vote count
    question.voteCount = question.votes.reduce((count, vote) => {
      return count + (vote.voteType === 'upvote' ? 1 : -1);
    }, 0);
    
    await question.save();
    
    res.json({
      message: `Vote ${action} successfully`,
      voteCount: question.voteCount,
      userVote: action === 'removed' ? null : voteType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
