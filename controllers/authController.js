import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Mock OTP service - Always use 123456 for development
const otpStorage = new Map();
const FIXED_OTP = '123456'; // Fixed OTP for development

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { phone, name, email } = req.body;
    
    // Store OTP with expiry (30 minutes for development ease)
    otpStorage.set(phone, {
      otp: FIXED_OTP,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      userData: { name, email }
    });
    
    console.log(`📱 OTP for ${phone}: ${FIXED_OTP}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Always show OTP in development for easy testing
      otp: FIXED_OTP
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify OTP and login/register user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const storedData = otpStorage.get(phone);
    
    if (!storedData || storedData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid'
      });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please use 123456'
      });
    }
    
    // Clear OTP after successful verification
    otpStorage.delete(phone);
    
    // Find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;
    
    if (!user) {
      user = await User.create({
        phone,
        name: storedData.userData.name || 'User',
        email: storedData.userData.email,
        isVerified: true
      });
      isNewUser = true;
      
      console.log(`✅ New user created: ${user.name} (${user.phone})`);
    } else {
      user.isVerified = true;
      user.lastActive = new Date();
      await user.save();
      
      console.log(`✅ User logged in: ${user.name} (${user.phone})`);
    }
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified
        },
        token,
        isNewUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const newToken = generateToken(user._id);
    
    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};


// Add this new function to the existing authController.js

// @desc    Update user profile after signup
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name: name || user.name,
        email: email || user.email
      },
      { new: true, runValidators: true }
    ).select('-__v');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          isVerified: user.isVerified
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


// Add this new function to the existing authController.js

// @desc    Admin login with credentials
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hardcoded admin credentials (in production, use proper password hashing)
    const adminCredentials = {
      'admin': 'admin123',
      'superadmin': 'super123'
    };
    
    if (!adminCredentials[username] || adminCredentials[username] !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    
    // Find or create admin user
    let adminUser = await User.findOne({ phone: `admin_${username}` });
    if (!adminUser) {
      adminUser = await User.create({
        name: username === 'superadmin' ? 'Super Admin' : 'Admin',
        phone: `admin_${username}`,
        email: `${username}@wordingo.com`,
        role: username,
        avatar: username === 'superadmin' ? '👑' : '🔧',
        bio: `${username === 'superadmin' ? 'Super Administrator' : 'Administrator'} of Wordingo`,
        isVerified: true
      });
    }
    
    const token = generateToken(adminUser._id);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: adminUser._id,
          name: adminUser.name,
          phone: adminUser.phone,
          email: adminUser.email,
          avatar: adminUser.avatar,
          role: adminUser.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
