import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/Post.js';
import User from '../models/User.js';

dotenv.config();

const dummyPosts = [
  {
    title: "Whispers of the Monsoon",
    content: "Rain-kissed memories dance on my window pane,\nEach drop a story of love and pain.\nThe earth drinks deep, the sky weeps slow,\nIn monsoon whispers, emotions flow.\n\nPetrichor rises from the dampened ground,\nNature's symphony, a soothing sound.\nThunder roars with tales untold,\nLightning writes in letters of gold.\n\nI stand beneath this curtain grey,\nWashing yesterday's sorrows away.",
    type: "Poetry",
    author: { name: "Priya Sharma", avatar: "🎨" },
    likes: 234
  },
  {
    title: "The Last Train Home",
    content: "The platform was empty except for the old man selling tea. His voice echoed through the station, 'Chai, garam chai!' I checked my watch - 11:47 PM. The last train would arrive in thirteen minutes.\n\nI had left home three years ago with nothing but a backpack and dreams. Now I was returning with the same backpack, but the dreams had transformed into something real, tangible.\n\nThe tea seller approached me. 'Going home, beta?'\n\n'Yes, uncle. After a long time.'\n\nHe smiled knowingly. 'The city teaches us much, but home teaches us who we are.'",
    type: "Short Story",
    author: { name: "Arjun Mehta", avatar: "📚" },
    likes: 567
  },
  {
    title: "The Art of Letting Go",
    content: "We hold on to things - memories, people, versions of ourselves - long after they have served their purpose. But what if letting go isn't about losing, but about making space?\n\nI learned this lesson on a rainy Tuesday afternoon while cleaning my grandmother's attic. Each box held a different era of her life, carefully preserved. Yet she lived freely, unburdened by the weight of these memories.\n\n'Keep what sparks joy,' she told me. 'But remember, the joy is in the living, not in the keeping.'\n\nLetting go is not defeat. It's liberation.",
    type: "Article",
    author: { name: "Kavya Reddy", avatar: "✍️" },
    likes: 892
  },
  {
    title: "Digital Detox Diary",
    content: "Day 1: I turned off my phone at 6 PM. The silence was deafening.\nDay 3: I read a book cover to cover. When did I last do that?\nDay 7: I had a conversation with a stranger at the coffee shop.\nDay 14: I wrote a letter by hand. My handwriting looks alien.\nDay 21: I realized I'd been living life through a screen.\n\nThe world didn't end when I disconnected. In fact, it became more vivid, more real, more mine.",
    type: "Essay",
    author: { name: "Rohit Singh", avatar: "📱" },
    likes: 445
  },
  {
    title: "Grandmother's Recipe",
    content: "Two cups of patience, stirred with love,\nA pinch of laughter from stars above.\nMix in some stories, old and wise,\nSeason with tears and gentle sighs.\n\nCook on memories, slow and low,\nLet childhood's warmth begin to grow.\nServe with hugs that heal the soul,\nThis recipe makes broken hearts whole.\n\nNo measurements can quite convey,\nThe magic in her special way.",
    type: "Poetry",
    author: { name: "Meera Joshi", avatar: "👵" },
    likes: 678
  },
  {
    title: "The Coffee Shop Chronicles",
    content: "Table 7 by the window sees it all. The student cramming for exams, coffee cold and forgotten. The writer staring at a blank page, cursor blinking like a heartbeat. The couple having their first date, nervous laughter mixing with espresso steam.\n\nI've been coming here for three years, always choosing table 7. Not for the view, but for the stories. Every person carries a universe of experiences, dreams, heartbreaks.\n\nToday, a little girl spilled her hot chocolate. As her mother cleaned up, the girl looked at me and smiled. Sometimes the smallest gestures remind us that we're all connected.",
    type: "Short Story",
    author: { name: "Aditya Kumar", avatar: "☕" },
    likes: 321
  },
  {
    title: "Night Thoughts",
    content: "3 AM thoughts hit different,\nWhen the world sleeps and you're awake,\nSilence becomes your closest friend,\nAnd solitude, the path you take.\n\nMoonlight streams through window panes,\nCasting shadows on the wall,\nIn these quiet, sacred hours,\nYou can hear your soul's true call.",
    type: "Poetry",
    author: { name: "Sneha Patel", avatar: "🌙" },
    likes: 543
  },
  {
    title: "The Unfinished Painting",
    content: "She found it in her father's studio after he passed - a canvas half-painted, brushes still damp with yesterday's colors. The painting showed a sunset, but only half the sky was complete.\n\nFor months, she couldn't bring herself to touch it. How do you finish someone else's vision? How do you add your brushstrokes to their story?\n\nThen one evening, as golden light filled the studio, she picked up his brush. She didn't try to paint like him. She painted like herself, adding her own colors to his sky.\n\nThe painting was finally complete - not as he would have finished it, but as it was meant to be: a collaboration across time.",
    type: "Short Story",
    author: { name: "Ravi Nair", avatar: "🎨" },
    likes: 756
  },
  {
    title: "Modern Love",
    content: "We fell in love through screens,\nEmojis replacing smiles,\nVoice notes bridging the distance,\nOf a thousand virtual miles.\n\nGood morning texts and goodnight calls,\nStories shared through status updates,\nOur hearts learned a new language,\nThat modern love creates.\n\nSome say it's not real,\nThis digital romance,\nBut love finds its own way,\nGiven half a chance.",
    type: "Poetry",
    author: { name: "Ananya Gupta", avatar: "💕" },
    likes: 823
  },
  {
    title: "The Bookstore Cat",
    content: "Every bookstore needs a cat, and Whiskers knew his job well. He'd curl up on bestsellers, ignore the classics, and somehow always find the customers who needed comfort.\n\nToday, he approached a teenage girl browsing poetry. She looked sad, the kind of sadness that seeps into your bones. Whiskers rubbed against her legs and purred.\n\n'He likes you,' I said from behind the counter.\n\nShe smiled for the first time since entering. 'I like him too.'\n\nShe bought three poetry books that day. Sometimes the best recommendations come from a wise old cat.",
    type: "Short Story",
    author: { name: "Divya Sharma", avatar: "📚" },
    likes: 634
  },
  {
    title: "Midnight Train",
    content: "The 12:30 to nowhere runs every night,\nCarrying dreams and broken hearts,\nPassengers with stories untold,\nEach one a journey that starts.\n\nSome run from their past,\nOthers chase their future,\nBut we're all just travelers,\nIn life's grand adventure.",
    type: "Poetry",
    author: { name: "Karthik Raj", avatar: "🚂" },
    likes: 467
  },
  {
    title: "The Language of Flowers",
    content: "My grandmother taught me that flowers have their own language. Roses speak of love, daisies whisper of innocence, and sunflowers shout of joy.\n\nAfter she passed, I planted a garden using her flower dictionary. Red roses for the love she gave us, white lilies for her pure heart, forget-me-nots so we'd always remember.\n\nEvery spring, her garden blooms, and I hear her voice in the rustling petals. Death may silence words, but flowers speak eternally.",
    type: "Article",
    author: { name: "Pooja Menon", avatar: "🌸" },
    likes: 789
  },
  {
    title: "City of Dreams",
    content: "Mumbai never sleeps, they say,\nBut I've seen it yawn at 4 AM,\nStretch its concrete arms,\nAnd whisper dreams to the sea.\n\nThe local trains carry hopes,\nIn their overcrowded cars,\nEvery passenger a story,\nReaching for distant stars.\n\nThis city of contradictions,\nWhere poverty meets gold,\nTeaches you that dreams survive,\nIf your heart is bold.",
    type: "Poetry",
    author: { name: "Sandeep More", avatar: "🏙️" },
    likes: 512
  },
  {
    title: "The Memory Keeper",
    content: "I collect memories like others collect stamps. Not photographs or souvenirs, but moments - the smell of jasmine on summer evenings, the sound of rain on tin roofs, the feeling of sand between my toes.\n\nToday I added a new one: the way my daughter laughed when she saw her first butterfly. Pure joy, untainted by worry or doubt.\n\nSomeday, when my memory fades, I hope these collected moments will be the last to go.",
    type: "Essay",
    author: { name: "Lakshmi Iyer", avatar: "🦋" },
    likes: 691
  },
  {
    title: "The Night Writer",
    content: "Words come alive at midnight,\nWhen the world is fast asleep,\nIn the quiet of the darkness,\nSecrets that I need to keep.\n\nPen meets paper, souls collide,\nStories birthed from silent hours,\nNight writing has its magic,\nUnlocking hidden powers.",
    type: "Poetry",
    author: { name: "Vikram Jha", avatar: "🖋️" },
    likes: 434
  },
  {
    title: "Street Food Philosophy",
    content: "The best conversations happen over street food. Standing at a chai stall, sharing space with strangers, barriers dissolve with every sip.\n\nYesterday, I met a taxi driver who quoted Rumi, a college student solving calculus on napkins, and an old man who'd lived through partition. We were united by masala chai and the understanding that life's deepest truths often come from the simplest moments.\n\nIn our sanitized world of social distancing, these chai stall conversations remind us what it means to be human.",
    type: "Article",
    author: { name: "Rahul Gupta", avatar: "☕" },
    likes: 578
  },
  {
    title: "The Lighthouse Keeper's Daughter",
    content: "She grew up counting ships, measuring distance by lighthouse beams. Her father kept the light burning, guiding vessels safely home, while she kept watch over his solitude.\n\nEvery ship that passed carried stories from distant lands. She'd imagine their cargo: spices from Kerala, textiles from Gujarat, dreams from every port.\n\nWhen her father grew old, she took over the lighthouse. Now she guides others home while keeping her own light burning bright.",
    type: "Short Story",
    author: { name: "Nisha Desai", avatar: "🗼" },
    likes: 723
  },
  {
    title: "Urban Jungle",
    content: "In the concrete maze we call home,\nNature finds a way to grow,\nWeeds through sidewalk cracks,\nBirds on high-rise window sills below.\n\nWe are the urban wildlife,\nAdapting to survive,\nFinding beauty in chaos,\nKeeping hope alive.",
    type: "Poetry",
    author: { name: "Arpit Saxena", avatar: "🌱" },
    likes: 389
  },
  {
    title: "The Last Letter",
    content: "Found it tucked inside an old book at the used bookstore - a love letter never sent, dated 1987. The paper had yellowed, but the words remained vibrant with emotion.\n\n'My dearest Radha,' it began, 'If you're reading this, I found the courage I've been searching for...'\n\nI wondered about the writer, about Radha, about the courage that perhaps came too late. Some stories end unfinished, but their echoes linger in the hearts of strangers who discover them decades later.",
    type: "Short Story",
    author: { name: "Shreya Kapoor", avatar: "💌" },
    likes: 645
  },
  {
    title: "Digital Nomad Blues",
    content: "Home is where the WiFi connects automatically,\nWhere your favorite coffee shop knows your order,\nWhere strangers become friends over shared tables,\nAnd every sunset looks like a new beginning.\n\nBut sometimes, in crowded co-working spaces,\nSurrounded by fellow wanderers,\nI miss the comfort of familiar walls,\nAnd wonder if freedom is just another word for loneliness.",
    type: "Essay",
    author: { name: "Aman Verma", avatar: "💻" },
    likes: 534
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kavya_db');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedPosts = async () => {
  try {
    await connectDB();
    
    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts...');
    
    // Create dummy users if they don't exist
    const authors = [...new Set(dummyPosts.map(post => post.author.name))];
    
    for (const authorName of authors) {
      const authorData = dummyPosts.find(post => post.author.name === authorName).author;
      const existingUser = await User.findOne({ name: authorName });
      
      if (!existingUser) {
        await User.create({
          name: authorName,
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`, // Random phone
          avatar: authorData.avatar,
          bio: `Writer | Storyteller | Creative Soul`
        });
        console.log(`Created user: ${authorName}`);
      }
    }
    
    // Create posts
    for (const postData of dummyPosts) {
      const author = await User.findOne({ name: postData.author.name });
      
      // Create likes array with random user IDs
      const likes = [];
      for (let i = 0; i < postData.likes; i++) {
        likes.push({
          user: author._id, // For simplicity, using same author
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
      
      const post = await Post.create({
        title: postData.title,
        content: postData.content,
        type: postData.type,
        author: author._id,
        likes: likes,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      console.log(`Created post: ${post.title}`);
    }
    
    console.log('✅ Successfully seeded 20 posts!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedPosts();
