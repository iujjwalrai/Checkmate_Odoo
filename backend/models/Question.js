const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  voteCount: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });

module.exports = mongoose.model('Question', questionSchema);