import Event from '../models/Event.js';

// @desc    Get all events with search and filtering
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { search, category, upcoming } = req.query;
    
    let filter = { isApproved: true };
    
    // Filter upcoming events
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }
    
    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    const events = await Event.find(filter)
      .populate('organizer', 'name avatar')
      .sort({ date: 1, createdAt: -1 })
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
          totalEvents: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
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

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar bio')
      .populate('attendees.user', 'name avatar');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Event not available'
      });
    }
    
    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
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
      organizer: req.user.id
    });
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully and submitted for approval',
      data: { event: populatedEvent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns the event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isApproved: false }, // Require re-approval after edit
      { new: true, runValidators: true }
    ).populate('organizer', 'name avatar');
    
    res.json({
      success: true,
      message: 'Event updated and sent for re-approval',
      data: { event: updatedEvent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.canUserRegister(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this event. Event may be full, registration closed, or you are already registered.'
      });
    }
    
    await event.registerUser(req.user.id);
    
    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        attendeeCount: event.attendeeCount,
        availableSpots: event.availableSpots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    await event.unregisterUser(req.user.id);
    
    res.json({
      success: true,
      message: 'Successfully unregistered from event',
      data: {
        attendeeCount: event.attendeeCount,
        availableSpots: event.availableSpots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's events (organized)
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ date: 1 });
    
    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/registered
// @access  Private
export const getRegisteredEvents = async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.user.id,
      'attendees.status': 'registered'
    })
    .populate('organizer', 'name avatar')
    .sort({ date: 1 });
    
    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
