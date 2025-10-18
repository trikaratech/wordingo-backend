import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Poetry', 'Launch', 'Workshop', 'Discussion', 'Reading', 'Meetup', 'Conference', 'Other'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String,
    validate: {
      validator: function(link) {
        if (this.isOnline && !link) return false;
        if (link && !/^https?:\/\/.+/.test(link)) return false;
        return true;
      },
      message: 'Valid online link is required for online events'
    }
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Maximum attendees limit is required'],
    min: [1, 'At least 1 attendee allowed'],
    max: [10000, 'Maximum 10000 attendees allowed']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    url: String,
    alt: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(deadline) {
        if (!deadline) return true; // Optional field
        return deadline <= this.date;
      },
      message: 'Registration deadline must be before event date'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ date: 1, isApproved: 1 });
eventSchema.index({ organizer: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees?.filter(attendee => attendee.status === 'registered').length || 0;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.maxAttendees - this.attendeeCount;
});

// Virtual for is full
eventSchema.virtual('isFull').get(function() {
  return this.attendeeCount >= this.maxAttendees;
});

// Instance methods
eventSchema.methods.canUserRegister = function(userId) {
  if (this.isFull) return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  if (new Date() > this.date) return false;
  
  const isAlreadyRegistered = this.attendees.some(
    attendee => attendee.user.toString() === userId.toString() && attendee.status === 'registered'
  );
  
  return !isAlreadyRegistered;
};

eventSchema.methods.registerUser = function(userId) {
  if (!this.canUserRegister(userId)) {
    throw new Error('Cannot register for this event');
  }
  
  this.attendees.push({
    user: userId,
    status: 'registered'
  });
  
  return this.save();
};

eventSchema.methods.unregisterUser = function(userId) {
  const attendeeIndex = this.attendees.findIndex(
    attendee => attendee.user.toString() === userId.toString() && attendee.status === 'registered'
  );
  
  if (attendeeIndex === -1) {
    throw new Error('User is not registered for this event');
  }
  
  this.attendees[attendeeIndex].status = 'cancelled';
  return this.save();
};

export default mongoose.model('Event', eventSchema);
