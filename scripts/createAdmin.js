import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kavya_db');
    console.log('MongoDB Connected for creating admin...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createAdminUsers = async () => {
  try {
    await connectDB();
    
    // Create Super Admin
    const superAdmin = await User.findOneAndUpdate(
      { phone: 'admin_superadmin' },
      {
        name: 'Super Admin',
        phone: 'admin_superadmin',
        email: 'superadmin@wordingo.com',
        role: 'superadmin',
        avatar: '👑',
        bio: 'Super Administrator of Wordingo',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    
    // Create Regular Admin
    const admin = await User.findOneAndUpdate(
      { phone: 'admin_admin' },
      {
        name: 'Admin',
        phone: 'admin_admin',
        email: 'admin@wordingo.com',
        role: 'admin',
        avatar: '🔧',
        bio: 'Administrator of Wordingo',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Admin users created/updated successfully!');
    console.log('Super Admin:', superAdmin.name, '- Username: superadmin, Password: super123');
    console.log('Admin:', admin.name, '- Username: admin, Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin users:', error);
    process.exit(1);
  }
};

createAdminUsers();
