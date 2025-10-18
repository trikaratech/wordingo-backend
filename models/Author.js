import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    default: ''
  },
  image: {
    url: String,
    alt: String
  },
  birthDate: {
    type: Date
  },
  nationality: {
    type: String,
    maxlength: [50, 'Nationality cannot exceed 50 characters']
  },
  website: {
    type: String,
    validate: {
      validator: function(url) {
        if (!url) return true;
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Please provide a valid website URL'
    }
  },
  socialLinks: {
    twitter: String,
    instagram: String,
    facebook: String,
    linkedin: String
  },
  genres: [{
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Self-Help', 'Finance', 'History', 'Poetry', 'Biography', 'Science', 'Technology', 'Other']
  }],
  awards: [{
    name: String,
    year: Number,
    description: String
  }],
  // Rating system for authors
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Link to user account if author is also a platform user
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    sparse: true
  },
  // Auto-generated fields
  bookCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name
authorSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Index for search
authorSchema.index({ name: 'text', bio: 'text' });
authorSchema.index({ slug: 1 });
authorSchema.index({ averageRating: -1, totalRatings: -1 });

// Virtual for books
authorSchema.virtual('books', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'authorId'
});

// Update rating method
authorSchema.methods.updateRating = async function() {
  const AuthorRating = mongoose.model('AuthorRating');
  
  const stats = await AuthorRating.aggregate([
    { $match: { author: this._id } },
    {
      $group: {
        _id: '$author',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalRatings = stats[0].totalRatings;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }

  await this.save();
};

// Update book count
authorSchema.methods.updateBookCount = async function() {
  const Book = mongoose.model('Book');
  const count = await Book.countDocuments({ authorId: this._id, isApproved: true });
  this.bookCount = count;
  await this.save();
};

export default mongoose.model('Author', authorSchema);
