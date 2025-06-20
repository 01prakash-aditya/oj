import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  problemId: {
    type: String,
    trim: true,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

discussionSchema.index({ title: 'text', content: 'text', tags: 'text' });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ author: 1 });
discussionSchema.index({ problemId: 1 });

// Pre-save middleware to limit tags
discussionSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 10) {
    this.tags = this.tags.slice(0, 10);
  }
  next();
});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;