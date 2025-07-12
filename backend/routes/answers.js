const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'votes' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort conditions
    let sortConditions = {};
    switch (sort) {
      case 'votes':
        sortConditions = { voteCount: -1, createdAt: -1 };
        break;
      case 'newest':
        sortConditions = { createdAt: -1 };
        break;
      case 'oldest':
        sortConditions = { createdAt: 1 };
        break;
      default:
        sortConditions = { voteCount: -1, createdAt: -1 };
    }
    
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'username avatar reputation')
      .sort(sortConditions)
      .skip(skip)
      .limit(limitNum);
    
    const totalAnswers = await Answer.countDocuments({ question: req.params.questionId });
    
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

// Create new answer
router.post('/', authenticate, async (req, res) => {
  try {
    const { questionId, content } = req.body;
    
    if (!questionId || !content) {
      return res.status(400).json({ error: 'Question ID and content are required' });
    }
    
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Create answer
    const answer = new Answer({
      question: questionId,
      author: req.user._id,
      content
    });
    
    await answer.save();
    
    // Update question answer count
    question.answerCount += 1;
    await question.save();
    
    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: question.author,
        actor: req.user._id,
        type: 'answer',
        entity: {
          entityId: answer._id,
          entityType: 'answer'
        },
        message: `${req.user.username} answered your question "${question.title}"`
      });
      await notification.save();
    }
    
    // Populate and return
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username avatar reputation');
    
    res.status(201).json({
      message: 'Answer created successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update answer
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    // Check if user is the author
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own answers' });
    }
    
    answer.content = content;
    await answer.save();
    
    const updatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username avatar reputation');
    
    res.json({
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete answer
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    // Check if user is the author or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own answers' });
    }
    
    // Update question answer count
    await Question.findByIdAndUpdate(answer.question, { $inc: { answerCount: -1 } });
    
    // If this was the accepted answer, remove it from question
    await Question.findByIdAndUpdate(answer.question, { $unset: { acceptedAnswer: 1 } });
    
    await Answer.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on answer
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    // Check if user already voted
    const existingVoteIndex = answer.votes.findIndex(
      vote => vote.user.toString() === req.user._id.toString()
    );
    
    let action = '';
    
    if (existingVoteIndex !== -1) {
      const existingVote = answer.votes[existingVoteIndex];
      
      if (existingVote.voteType === voteType) {
        // Remove vote
        answer.votes.splice(existingVoteIndex, 1);
        action = 'removed';
      } else {
        // Change vote
        answer.votes[existingVoteIndex].voteType = voteType;
        action = 'changed';
      }
    } else {
      // Add new vote
      answer.votes.push({ user: req.user._id, voteType });
      action = 'added';
    }
    
    // Calculate vote count
    answer.voteCount = answer.votes.reduce((count, vote) => {
      return count + (vote.voteType === 'upvote' ? 1 : -1);
    }, 0);
    
    await answer.save();
    
    res.json({
      message: `Vote ${action} successfully`,
      voteCount: answer.voteCount,
      userVote: action === 'removed' ? null : voteType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept answer (only question author can do this)
router.post('/:id/accept', authenticate, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user is the question author
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the question author can accept answers' });
    }
    
    // Check if this answer is already accepted
    if (question.acceptedAnswer && question.acceptedAnswer.toString() === answer._id.toString()) {
      // Unaccept the answer
      question.acceptedAnswer = null;
      await question.save();
      
      res.json({
        message: 'Answer unaccepted successfully',
        accepted: false
      });
    } else {
      // Accept this answer (remove any previous accepted answer)
      question.acceptedAnswer = answer._id;
      await question.save();
      
      // Create notification for answer author
      if (answer.author.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: answer.author,
          actor: req.user._id,
          type: 'accepted_answer',
          entity: {
            entityId: answer._id,
            entityType: 'answer'
          },
          message: `${req.user.username} accepted your answer to "${question.title}"`
        });
        await notification.save();
      }
      
      res.json({
        message: 'Answer accepted successfully',
        accepted: true
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;