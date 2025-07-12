const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200
  },
  questionCount: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tag', tagSchema);