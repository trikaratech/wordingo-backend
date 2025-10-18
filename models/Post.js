import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Story', 'Poetry', 'Article', 'Review', 'Discussion', 'Other'],
    default: 'Other'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  saves: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtuals
postSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

postSchema.virtual('saveCount').get(function() {
  return this.saves?.length || 0;
});

postSchema.virtual('commentCount').get(function() {
  // For now, return 0. We'll implement comments later
  return 0;
});

// Methods
postSchema.methods.isLikedBy = function(userId) {
  if (!userId || !this.likes) return false;
  return this.likes.some(like => like.user.toString() === userId.toString());
};

postSchema.methods.isSavedBy = function(userId) {
  if (!userId || !this.saves) return false;
  return this.saves.some(save => save.user.toString() === userId.toString());
};

export default mongoose.model('Post', postSchema);
