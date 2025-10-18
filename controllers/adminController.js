import User from '../models/User.js';
import Book from '../models/Book.js';
import Event from '../models/Event.js';
import Post from '../models/Post.js';
import BookReview from '../models/BookReview.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalEvents,
      totalPosts,
      pendingBooks,
      pendingEvents,
      recentUsers,
      recentBooks,
      recentEvents
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Book.countDocuments(),
      Event.countDocuments(),
      Post.countDocuments(),
      Book.countDocuments({ isApproved: false }),
      Event.countDocuments({ isApproved: false }),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name avatar createdAt'),
      Book.find().sort({ createdAt: -1 }).limit(5).populate('addedBy', 'name'),
      Event.find().sort({ createdAt: -1 }).limit(5).populate('organizer', 'name')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBooks,
          totalEvents,
          totalPosts,
          pendingBooks,
          pendingEvents
        },
        recent: {
          users: recentUsers,
          books: recentBooks,
          events: recentEvents
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

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let filter = { role: { $ne: 'superadmin' } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total
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

// @desc    Update user status/role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isVerified },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all books for admin
// @route   GET /api/admin/books
// @access  Private/Admin
export const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all'; // all, pending, approved

    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const books = await Book.find(filter)
      .populate('addedBy', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBooks: total
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

// @desc    Approve/Reject book
// @route   PUT /api/admin/books/:id/status
// @access  Private/Admin
export const updateBookStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('addedBy', 'name');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: `Book ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { book }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/admin/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Also delete associated reviews
    await BookReview.deleteMany({ book: req.params.id });

    res.json({
      success: true,
      message: 'Book and associated reviews deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all events for admin
// @route   GET /api/admin/events
// @access  Private/Admin
export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'all';

    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'approved') filter.isApproved = true;

    const events = await Event.find(filter)
      .populate('organizer', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total
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

// @desc    Approve/Reject event
// @route   PUT /api/admin/events/:id/status
// @access  Private/Admin
export const updateEventStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate('organizer', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: `Event ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Add this function to the existing adminController.js

// @desc    Create new book (admin)
// @route   POST /api/admin/books
// @access  Private/Admin
export const createBook = async (req, res) => {
    try {
      const {
        title,
        author,
        description,
        category,
        publishYear,
        isbn,
        price,
        images,
        buyLinks,
        tags
      } = req.body;
      
      const book = await Book.create({
        title,
        author,
        description,
        category,
        publishYear,
        isbn,
        price,
        images,
        buyLinks,
        tags,
        addedBy: req.user.id,
        isApproved: true // Admin books are auto-approved
      });
      
      const populatedBook = await Book.findById(book._id)
        .populate('addedBy', 'name avatar');
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: { book: populatedBook }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Update book (admin)
  // @route   PUT /api/admin/books/:id
  // @access  Private/Admin
  export const updateBook = async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('addedBy', 'name avatar');
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Book updated successfully',
        data: { book }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Create new event (admin)
  // @route   POST /api/admin/events
  // @access  Private/Admin
  export const createEvent = async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        date,
        time,
        location,
        isOnline,
        onlineLink,
        maxAttendees,
        image,
        tags,
        price,
        registrationDeadline
      } = req.body;
      
      const event = await Event.create({
        title,
        description,
        category,
        date,
        time,
        location,
        isOnline,
        onlineLink,
        maxAttendees,
        image,
        tags,
        price,
        isPaid: price > 0,
        registrationDeadline,
        organizer: req.user.id,
        isApproved: true // Admin events are auto-approved
      });
      
      const populatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name avatar');
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event: populatedEvent }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Update event (admin)
  // @route   PUT /api/admin/events/:id
  // @access  Private/Admin
  export const updateEvent = async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('organizer', 'name avatar');
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Event updated successfully',
        data: { event }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  

  // Add these functions to the existing adminController.js

// @desc    Get all authors for admin
// @route   GET /api/admin/authors
// @access  Private/Admin
export const getAuthorsAdmin = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';
  
      let filter = {};
      if (search) {
        filter.$text = { $search: search };
      }
  
      const authors = await Author.find(filter)
        .sort({ bookCount: -1, name: 1 })
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
  
  // @desc    Update author details
  // @route   PUT /api/admin/authors/:id
  // @access  Private/Admin
  export const updateAuthor = async (req, res) => {
    try {
      const author = await Author.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
  
      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }
  
      res.json({
        success: true,
        message: 'Author updated successfully',
        data: { author }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Get author details for admin
  // @route   GET /api/admin/authors/:id
  // @access  Private/Admin
  export const getAuthorAdmin = async (req, res) => {
    try {
      const author = await Author.findById(req.params.id);
      
      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }
  
      // Get author's books
      const books = await Book.find({ authorId: author._id })
        .sort({ createdAt: -1 });
  
      // Get ratings count
      const ratingsCount = await AuthorRating.countDocuments({ author: author._id });
  
      res.json({
        success: true,
        data: {
          author,
          books,
          ratingsCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  


// @desc    Create new author
// @route   POST /api/admin/authors
// @access  Private/Admin
export const createAuthor = async (req, res) => {
    try {
      const {
        name,
        bio,
        image,
        birthDate,
        nationality,
        website,
        socialLinks,
        genres,
        awards,
        isVerified
      } = req.body;
      
      // Check if author already exists
      const existingAuthor = await Author.findOne({ name });
      if (existingAuthor) {
        return res.status(400).json({
          success: false,
          message: 'Author with this name already exists'
        });
      }
      
      const author = await Author.create({
        name,
        bio,
        image,
        birthDate: birthDate ? new Date(birthDate) : null,
        nationality,
        website,
        socialLinks,
        genres: genres || [],
        awards: awards || [],
        isVerified: isVerified || false
      });
      
      res.status(201).json({
        success: true,
        message: 'Author created successfully',
        data: { author }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Delete author
  // @route   DELETE /api/admin/authors/:id
  // @access  Private/Admin
  export const deleteAuthor = async (req, res) => {
    try {
      const author = await Author.findById(req.params.id);
      
      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found'
        });
      }
      
      // Check if author has books
      const Book = mongoose.model('Book');
      const bookCount = await Book.countDocuments({ authorId: author._id });
      
      if (bookCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete author. They have ${bookCount} book(s) associated. Please remove or reassign the books first.`
        });
      }
      
      // Delete author ratings
      const AuthorRating = mongoose.model('AuthorRating');
      await AuthorRating.deleteMany({ author: author._id });
      
      // Delete the author
      await Author.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Author deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // @desc    Get authors list for dropdown
  // @route   GET /api/admin/authors/list
  // @access  Private/Admin
  export const getAuthorsForDropdown = async (req, res) => {
    try {
      const authors = await Author.find({})
        .select('_id name bookCount')
        .sort({ name: 1 });
      
      res.json({
        success: true,
        data: { authors }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  