import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: '✍️'
  },
  bio: {
    type: String,
    default: 'Writer | Storyteller | Dreamer'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Instance methods
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'superadmin';
};

userSchema.methods.isSuperAdmin = function() {
  return this.role === 'superadmin';
};

export default mongoose.model('User', userSchema);
