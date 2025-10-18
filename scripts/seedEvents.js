import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import User from '../models/User.js';

dotenv.config();

const sampleEvents = [
  {
    title: "Poetry Reading Night",
    description: "Join us for an evening of beautiful poetry readings by local authors and poets. Experience the magic of spoken word and connect with fellow poetry lovers.",
    category: "Poetry",
    date: new Date('2025-10-20T19:00:00Z'),
    time: "7:00 PM",
    location: "City Library Auditorium",
    isOnline: false,
    maxAttendees: 100,
    price: 0,
    image: {
      url: "https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Poetry+Night",
      alt: "Poetry Reading Night"
    },
    tags: ["poetry", "reading", "literature"],
    isApproved: true
  },
  {
    title: "Book Launch: 'Digital Dreams'",
    description: "Celebrate the launch of the new science fiction novel by acclaimed author Sarah Chen. Meet the author, get your book signed, and enjoy refreshments.",
    category: "Launch",
    date: new Date('2025-10-25T18:30:00Z'),
    time: "6:30 PM",
    location: "BookCafe Downtown",
    isOnline: false,
    maxAttendees: 80,
    price: 200,
    image: {
      url: "https://via.placeholder.com/400x200/10B981/FFFFFF?text=Book+Launch",
      alt: "Book Launch Event"
    },
    tags: ["book launch", "science fiction", "author meet"],
    isApproved: true
  },
  {
    title: "Writing Workshop: Character Development",
    description: "Learn the art of creating compelling characters in your stories. Interactive workshop with practical exercises and personalized feedback.",
    category: "Workshop",
    date: new Date('2025-10-30T14:00:00Z'),
    time: "2:00 PM",
    location: "Online via Zoom",
    isOnline: true,
    onlineLink: "https://zoom.us/j/123456789",
    maxAttendees: 50,
    price: 500,
    image: {
      url: "https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Workshop",
      alt: "Writing Workshop"
    },
    tags: ["writing", "workshop", "character development"],
    registrationDeadline: new Date('2025-10-28T23:59:59Z'),
    isApproved: true
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kavya_db');
    console.log('MongoDB Connected for seeding events...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedEvents = async () => {
  try {
    await connectDB();
    
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events...');
    
    // Get or create admin user
    let adminUser = await User.findOne({ name: 'Event Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Event Admin',
        phone: '9999888877',
        avatar: '📅',
        bio: 'Event organizer and community manager'
      });
      console.log('Created event admin user');
    }
    
    // Create events
    for (const eventData of sampleEvents) {
      const event = await Event.create({
        ...eventData,
        organizer: adminUser._id
      });
      
      // Add some sample attendees
      const attendeeCount = Math.floor(Math.random() * (event.maxAttendees * 0.8));
      for (let i = 0; i < attendeeCount; i++) {
        event.attendees.push({
          user: adminUser._id,
          status: 'registered'
        });
      }
      
      await event.save();
      console.log(`Created event: ${event.title} (${event.attendeeCount}/${event.maxAttendees} attendees)`);
    }
    
    console.log('✅ Successfully seeded events!');
    
    // Show summary
    const eventCount = await Event.countDocuments();
    console.log(`📊 Summary: ${eventCount} events created`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedEvents();
