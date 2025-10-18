import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';
import BookReview from '../models/BookReview.js';
import User from '../models/User.js';

dotenv.config();

const sampleBooks = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?",
    category: "Fiction",
    publishYear: 2020,
    isbn: "9781786892720",
    price: "₹299",
    images: [
      { url: "https://via.placeholder.com/300x450/3B82F6/FFFFFF?text=The+Midnight+Library", alt: "The Midnight Library cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" }
    ],
    tags: ["philosophy", "life", "choices", "fiction"],
    isApproved: true
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    category: "Self-Help",
    publishYear: 2018,
    isbn: "9780735211292",
    price: "₹450",
    images: [
      { url: "https://via.placeholder.com/300x450/10B981/FFFFFF?text=Atomic+Habits", alt: "Atomic Habits cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" },
      { name: "BookDepository", url: "https://bookdepository.com" }
    ],
    tags: ["habits", "productivity", "self-improvement", "psychology"],
    isApproved: true
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people. Money—investing, personal finance, and business decisions—is typically taught as a math-based field, where data and formulas tell us exactly what to do.",
    category: "Finance",
    publishYear: 2020,
    isbn: "9780857197689",
    price: "₹350",
    images: [
      { url: "https://via.placeholder.com/300x450/F59E0B/FFFFFF?text=Psychology+of+Money", alt: "The Psychology of Money cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" }
    ],
    tags: ["money", "psychology", "finance", "investing"],
    isApproved: true
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be \"human.\"",
    category: "History",
    publishYear: 2011,
    isbn: "9780062316097",
    price: "₹499",
    images: [
      { url: "https://via.placeholder.com/300x450/EF4444/FFFFFF?text=Sapiens", alt: "Sapiens cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" },
      { name: "BookDepository", url: "https://bookdepository.com" }
    ],
    tags: ["history", "evolution", "humanity", "anthropology"],
    isApproved: true
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    description: "A guide to spiritual enlightenment. The Power of Now shows you that every minute you spend worrying about the future or regretting the past is a minute lost, because really all you have to live in is the present, the now.",
    category: "Self-Help",
    publishYear: 1997,
    isbn: "9781577314806",
    price: "₹399",
    images: [
      { url: "https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=Power+of+Now", alt: "The Power of Now cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" }
    ],
    tags: ["spirituality", "mindfulness", "self-help", "meditation"],
    isApproved: true
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian social science fiction novel. It follows the life of Winston Smith, a low ranking member of 'the Party', who is frustrated by the omnipresent eyes of the party, and its ominous ruler Big Brother.",
    category: "Fiction",
    publishYear: 1949,
    isbn: "9780452284234",
    price: "₹250",
    images: [
      { url: "https://via.placeholder.com/300x450/6B7280/FFFFFF?text=1984", alt: "1984 cover" }
    ],
    buyLinks: [
      { name: "Amazon", url: "https://amazon.in" },
      { name: "Flipkart", url: "https://flipkart.com" }
    ],
    tags: ["dystopia", "politics", "surveillance", "classic"],
    isApproved: true
  }
];

const reviewData = [
  {
    name: "Alice Johnson",
    avatar: "👩",
    reviews: [
      { rating: 5, text: "Absolutely loved this book! The writing style is captivating and the story keeps you hooked from the first page. Definitely recommend to anyone looking for a thought-provoking read." },
      { rating: 4, text: "Great book with interesting concepts. Some parts were a bit slow, but overall a very engaging read." },
      { rating: 5, text: "This book changed my perspective on many things. Well written and thoroughly researched." }
    ]
  },
  {
    name: "Mike Chen",
    avatar: "👨",
    reviews: [
      { rating: 4, text: "Excellent read! The author's perspective on the subject matter is unique and well-researched. Would definitely read more books from this author." },
      { rating: 5, text: "One of the best books I've read this year. Highly recommend!" },
      { rating: 4, text: "Insightful and well-written. Made me think about things differently." }
    ]
  },
  {
    name: "Sarah Williams",
    avatar: "🧑‍💼",
    reviews: [
      { rating: 5, text: "This book is a masterpiece! Every chapter brings new insights and perspectives. A must-read for everyone." },
      { rating: 4, text: "Really enjoyed this book. The author has a great way of explaining complex concepts in simple terms." },
      { rating: 5, text: "Couldn't put it down! The storytelling is incredible and the message is powerful." }
    ]
  },
  {
    name: "David Kumar",
    avatar: "👨‍💻",
    reviews: [
      { rating: 4, text: "Solid book with practical advice. I've already started implementing some of the suggestions." },
      { rating: 5, text: "Amazing insights! This book should be mandatory reading for everyone." },
      { rating: 4, text: "Well-researched and thought-provoking. Learned a lot from this book." }
    ]
  },
  {
    name: "Priya Patel",
    avatar: "👩‍🎓",
    reviews: [
      { rating: 5, text: "Beautiful writing and profound insights. This book touched my soul and changed how I see the world." },
      { rating: 4, text: "Engaging from start to finish. The author has a gift for storytelling." },
      { rating: 5, text: "A transformative read. I'll be recommending this to all my friends and family." }
    ]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kavya_db');
    console.log('MongoDB Connected for seeding books...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedBooks = async () => {
  try {
    await connectDB();
    
    // Clear existing books and reviews
    await Book.deleteMany({});
    await BookReview.deleteMany({});
    console.log('Cleared existing books and reviews...');
    
    // Create or get users for reviews
    const users = [];
    for (const reviewer of reviewData) {
      let user = await User.findOne({ name: reviewer.name });
      if (!user) {
        // Create user with unique phone number
        const phoneNumber = '98765' + (10000 + users.length).toString();
        user = await User.create({
          name: reviewer.name,
          phone: phoneNumber,
          avatar: reviewer.avatar,
          bio: 'Book reviewer and reader'
        });
        console.log(`Created user: ${user.name}`);
      }
      users.push({ user, reviews: reviewer.reviews });
    }
    
    // Get admin user for adding books
    let adminUser = await User.findOne({ name: 'Book Admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Book Admin',
        phone: '9999999999',
        avatar: '📚',
        bio: 'Book curator and administrator'
      });
      console.log('Created book admin user');
    }
    
    // Create books with reviews
    for (let bookIndex = 0; bookIndex < sampleBooks.length; bookIndex++) {
      const bookData = sampleBooks[bookIndex];
      
      const book = await Book.create({
        ...bookData,
        addedBy: adminUser._id
      });
      
      // Add reviews from different users (2-4 reviews per book)
      const numberOfReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews
      const selectedUsers = users.slice(0, numberOfReviews);
      
      for (let userIndex = 0; userIndex < selectedUsers.length; userIndex++) {
        const { user, reviews } = selectedUsers[userIndex];
        const reviewIndex = Math.floor(Math.random() * reviews.length);
        const reviewContent = reviews[reviewIndex];
        
        try {
          const review = await BookReview.create({
            book: book._id,
            user: user._id,
            rating: reviewContent.rating,
            review: reviewContent.text,
            // Add some random upvotes/downvotes
            upvotes: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => ({
              user: users[Math.floor(Math.random() * users.length)].user._id
            })),
            downvotes: Array.from({ length: Math.floor(Math.random() * 2) }, () => ({
              user: users[Math.floor(Math.random() * users.length)].user._id
            }))
          });
          
          console.log(`Added review by ${user.name} for ${book.title}`);
        } catch (error) {
          console.log(`Skipped duplicate review for ${book.title} by ${user.name}`);
        }
      }
      
      // Update book rating after adding reviews
      await book.updateRating();
      console.log(`Created book: ${book.title} (Rating: ${book.averageRating})`);
    }
    
    console.log('✅ Successfully seeded books with reviews and ratings!');
    
    // Show summary
    const bookCount = await Book.countDocuments();
    const reviewCount = await BookReview.countDocuments();
    console.log(`📊 Summary: ${bookCount} books, ${reviewCount} reviews`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedBooks();
