const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'txt', 'notes'],
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  fileName: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
