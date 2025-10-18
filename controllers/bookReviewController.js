import BookReview from '../models/BookReview.js';
import Book from '../models/Book.js';

// @desc    Get reviews for a book
// @route   GET /api/books/:bookId/reviews
// @access  Public
export const getBookReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'newest';
    
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating-high':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { upvotes: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const reviews = await BookReview.find({ book: req.params.bookId })
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await BookReview.countDocuments({ book: req.params.bookId });
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('book', 'title author');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review for a book
// @route   POST /api/books/:bookId/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const bookId = req.params.bookId;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Check if user already reviewed this book
    const existingReview = await BookReview.findOne({
      book: bookId,
      user: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }
    
    const newReview = await BookReview.create({
      book: bookId,
      user: req.user.id,
      rating,
      review
    });
    
    const populatedReview = await BookReview.findById(newReview._id)
      .populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review: populatedReview }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    const updatedReview = await BookReview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    await BookReview.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upvote review
// @route   POST /api/reviews/:id/upvote
// @access  Private
export const upvoteReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Remove from downvotes if exists
    review.downvotes = review.downvotes.filter(
      vote => vote.user.toString() !== req.user.id
    );
    
    // Check if already upvoted
    const alreadyUpvoted = review.upvotes.some(
      vote => vote.user.toString() === req.user.id
    );
    
    if (alreadyUpvoted) {
      // Remove upvote
      review.upvotes = review.upvotes.filter(
        vote => vote.user.toString() !== req.user.id
      );
    } else {
      // Add upvote
      review.upvotes.push({ user: req.user.id });
    }
    
    await review.save();
    
    res.json({
      success: true,
      data: {
        upvoteCount: review.upvoteCount,
        downvoteCount: review.downvoteCount,
        isUpvoted: !alreadyUpvoted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Downvote review
// @route   POST /api/reviews/:id/downvote
// @access  Private
export const downvoteReview = async (req, res) => {
  try {
    const review = await BookReview.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Remove from upvotes if exists
    review.upvotes = review.upvotes.filter(
      vote => vote.user.toString() !== req.user.id
    );
    
    // Check if already downvoted
    const alreadyDownvoted = review.downvotes.some(
      vote => vote.user.toString() === req.user.id
    );
    
    if (alreadyDownvoted) {
      // Remove downvote
      review.downvotes = review.downvotes.filter(
        vote => vote.user.toString() !== req.user.id
      );
    } else {
      // Add downvote
      review.downvotes.push({ user: req.user.id });
    }
    
    await review.save();
    
    res.json({
      success: true,
      data: {
        upvoteCount: review.upvoteCount,
        downvoteCount: review.downvoteCount,
        isDownvoted: !alreadyDownvoted
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
