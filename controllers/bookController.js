import Book from '../models/Book.js';
import BookReview from '../models/BookReview.js';

// @desc    Get all books with search and filtering
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { search, category, sortBy } = req.query;
    
    let filter = { isApproved: true };
    
    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      filter.category = category;
    }
    
    // Sort options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { averageRating: -1, totalReviews: -1 };
        break;
      case 'reviews':
        sortOption = { totalReviews: -1, averageRating: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'year':
        sortOption = { publishYear: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const books = await Book.find(filter)
      .populate('addedBy', 'name avatar')
      .populate('authorId', 'name slug averageRating totalRatings image') // Add author population
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('title author authorId description category publishYear isbn price images buyLinks tags averageRating totalReviews isApproved createdAt updatedAt'); // Explicitly include images
    
    const total = await Book.countDocuments(filter);
    
    // Debug: Log first book to check images
    if (books.length > 0) {
      console.log('Sample book images:', books[0].images);
    }
    
    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBooks: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('getBooks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'name avatar')
      .populate('authorId', 'name slug averageRating totalRatings image bio'); // Add author population
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    if (!book.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Book not available'
      });
    }
    
    // Get reviews for this book
    const reviews = await BookReview.find({ book: book._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: { 
        book,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private
export const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      authorId, // Add support for selecting existing author
      description,
      category,
      publishYear,
      isbn,
      price,
      images,
      buyLinks,
      tags
    } = req.body;
    
    const bookData = {
      title,
      author,
      description,
      category,
      publishYear,
      isbn,
      price,
      images: images || [], // Ensure images is an array
      buyLinks: buyLinks || [], // Ensure buyLinks is an array
      tags: Array.isArray(tags) ? tags : [], // Handle tags as array
      addedBy: req.user.id
    };
    
    // Add authorId if provided
    if (authorId) {
      bookData.authorId = authorId;
    }
    
    const book = await Book.create(bookData);
    
    const populatedBook = await Book.findById(book._id)
      .populate('addedBy', 'name avatar')
      .populate('authorId', 'name slug');
    
    res.status(201).json({
      success: true,
      message: 'Book submitted for review',
      data: { book: populatedBook }
    });
  } catch (error) {
    console.error('addBook error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Check if user owns the book or is admin (for future)
    if (book.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this book'
      });
    }
    
    const updateData = { 
      ...req.body, 
      isApproved: false // Require re-approval after edit
    };
    
    // Handle tags conversion
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name avatar')
     .populate('authorId', 'name slug');
    
    res.json({
      success: true,
      message: 'Book updated and sent for re-approval',
      data: { book: updatedBook }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get book categories
// @route   GET /api/books/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isApproved: true });
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get popular/trending books
// @route   GET /api/books/trending
// @access  Public
export const getTrendingBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const books = await Book.find({ isApproved: true })
      .sort({ totalReviews: -1, averageRating: -1 })
      .limit(limit)
      .populate('addedBy', 'name')
      .populate('authorId', 'name slug')
      .select('title author authorId description category price images averageRating totalReviews'); // Include images
    
    res.json({
      success: true,
      data: { books }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Debug - Check book images
// @route   GET /api/books/debug-images
// @access  Public (temporary)
export const debugBookImages = async (req, res) => {
  try {
    const books = await Book.find({ isApproved: true })
      .limit(5)
      .select('title images');
    
    const debug = books.map(book => ({
      title: book.title,
      hasImages: !!book.images,
      imageCount: book.images?.length || 0,
      firstImageUrl: book.images?.[0]?.url,
      firstImageAlt: book.images?.[0]?.alt
    }));
    
    res.json({
      success: true,
      data: { debug }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
