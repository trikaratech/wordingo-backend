import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  // Add reference to Author model
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Author'
  },
  description: {
    type: String,
    required: [true, 'Book description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Self-Help', 'Finance', 'History', 'Poetry', 'Biography', 'Science', 'Technology', 'Other'],
    default: 'Other'
  },
  publishYear: {
    type: Number,
    required: true,
    min: [1000, 'Invalid publish year'],
    max: [new Date().getFullYear(), 'Publish year cannot be in the future']
  },
  isbn: {
    type: String,
    sparse: true,
    unique: true
  },
  price: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    alt: String
  }],
  buyLinks: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  addedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ category: 1, averageRating: -1 });
bookSchema.index({ averageRating: -1, totalReviews: -1 });
bookSchema.index({ authorId: 1 });

// Virtual for review count
bookSchema.virtual('reviewCount', {
  ref: 'BookReview',
  localField: '_id',
  foreignField: 'book',
  count: true
});

// Pre-save middleware to handle author
bookSchema.pre('save', async function(next) {
  if (this.isModified('author') || this.isNew) {
    const Author = mongoose.model('Author');
    
    // Find or create author
    let author = await Author.findOne({ name: this.author });
    if (!author) {
      author = await Author.create({
        name: this.author,
        genres: [this.category]
      });
    } else {
      // Update genres if not already included
      if (!author.genres.includes(this.category)) {
        author.genres.push(this.category);
        await author.save();
      }
    }
    
    this.authorId = author._id;
  }
  next();
});

// Post-save middleware to update author book count
bookSchema.post('save', async function() {
  if (this.authorId) {
    const Author = mongoose.model('Author');
    const author = await Author.findById(this.authorId);
    if (author) {
      await author.updateBookCount();
    }
  }
});

// Post-remove middleware to update author book count
bookSchema.post('remove', async function() {
  if (this.authorId) {
    const Author = mongoose.model('Author');
    const author = await Author.findById(this.authorId);
    if (author) {
      await author.updateBookCount();
    }
  }
});

// Update average rating when reviews change
bookSchema.methods.updateRating = async function() {
  const BookReview = mongoose.model('BookReview');
  
  const stats = await BookReview.aggregate([
    { $match: { book: this._id } },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }

  await this.save();
};

export default mongoose.model('Book', bookSchema);
