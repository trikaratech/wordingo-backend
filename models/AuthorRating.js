import mongoose from 'mongoose';

const authorRatingSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'Author',
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
    maxlength: [500, 'Review cannot exceed 500 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// Ensure one rating per user per author
authorRatingSchema.index({ author: 1, user: 1 }, { unique: true });

// Post-save middleware to update author rating
authorRatingSchema.post('save', async function() {
  const Author = mongoose.model('Author');
  const author = await Author.findById(this.author);
  if (author) {
    await author.updateRating();
  }
});

// Post-remove middleware to update author rating
authorRatingSchema.post('remove', async function() {
  const Author = mongoose.model('Author');
  const author = await Author.findById(this.author);
  if (author) {
    await author.updateRating();
  }
});

export default mongoose.model('AuthorRating', authorRatingSchema);
