import Author from '../models/Author.js';
import AuthorRating from '../models/AuthorRating.js';
import Book from '../models/Book.js';

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
export const getAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'name';

    let filter = { bookCount: { $gt: 0 } }; // Only authors with books
    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { averageRating: -1, totalRatings: -1 };
        break;
      case 'books':
        sortOption = { bookCount: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { name: 1 };
    }

    const authors = await Author.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Author.countDocuments(filter);

    res.json({
      success: true,
      data: {
        authors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAuthors: total
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

// @desc    Get single author by slug
// @route   GET /api/authors/:slug
// @access  Public
export const getAuthor = async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug });
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Get author's books
    const books = await Book.find({ 
      authorId: author._id, 
      isApproved: true 
    }).sort({ createdAt: -1 });

    // Get recent ratings
    const ratings = await AuthorRating.find({ author: author._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        author,
        books,
        ratings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Rate an author
// @route   POST /api/authors/:slug/rate
// @access  Private
export const rateAuthor = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const author = await Author.findOne({ slug: req.params.slug });
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check if user already rated this author
    const existingRating = await AuthorRating.findOne({
      author: author._id,
      user: req.user.id
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      // Create new rating
      await AuthorRating.create({
        author: author._id,
        user: req.user.id,
        rating,
        review
      });
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's rating for an author
// @route   GET /api/authors/:slug/my-rating
// @access  Private
export const getMyAuthorRating = async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug });
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    const rating = await AuthorRating.findOne({
      author: author._id,
      user: req.user.id
    });

    res.json({
      success: true,
      data: { rating }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
