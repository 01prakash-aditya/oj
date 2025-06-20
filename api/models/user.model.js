import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "https://tableconvert.com/images/avatar.png",
  },
  fullName: {
    type: String,
    default: "",
  },
  dob: {
    type: Date,
    default: null,
  },
  bio: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  questionCount: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  solvedProblems: [
    {
      problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
      solvedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, { 
  timestamps: true,
  indexes: [
    { username: 1 }, 
    { email: 1 },    
    { rating: -1 },  
    { isActive: 1, rating: -1 },
    { role: 1 } 
  ]
});

const User = mongoose.model('User', userSchema);

export default User;