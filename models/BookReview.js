import mongoose from 'mongoose';

const bookReviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
    trim: true
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure one review per user per book
bookReviewSchema.index({ book: 1, user: 1 }, { unique: true });
bookReviewSchema.index({ book: 1, createdAt: -1 });

// Virtual for upvote count
bookReviewSchema.virtual('upvoteCount').get(function() {
  return this.upvotes?.length || 0;
});

// Virtual for downvote count
bookReviewSchema.virtual('downvoteCount').get(function() {
  return this.downvotes?.length || 0;
});

// Pre-save middleware
bookReviewSchema.pre('save', function(next) {
  if (this.isModified('review') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Post-save middleware to update book rating
bookReviewSchema.post('save', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.updateRating();
  }
});

// Post-remove middleware to update book rating
bookReviewSchema.post('remove', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.updateRating();
  }
});

// Instance methods
bookReviewSchema.methods.isUpvotedBy = function(userId) {
  return this.upvotes.some(upvote => upvote.user.toString() === userId.toString());
};

bookReviewSchema.methods.isDownvotedBy = function(userId) {
  return this.downvotes.some(downvote => downvote.user.toString() === userId.toString());
};

export default mongoose.model('BookReview', bookReviewSchema);
