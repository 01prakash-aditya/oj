import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    required: true
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'moderate', 'difficult']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  tags: [{
    type: String,
    required: true
  }],
  defaultCode: {
    type: String,
    required: true
  },
  testCases: [testCaseSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;