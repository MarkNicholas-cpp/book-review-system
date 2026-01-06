// Static Data Store - Replaces API calls with in-memory data + localStorage
// This makes the app work as a static site for Netlify deployment

import type { User } from './usersService';
import type { Review } from './reviewsService';
import type { Blog } from './blogsService';
import type { Favorite } from './favoritesService';
import type { Genre } from './genresService';

interface DataStore {
  users: User[];
  reviews: Review[];
  blogs: Blog[];
  favorites: Favorite[];
  genres: Genre[];
  follows: Array<{ id: number; followerId: number; followingId: number }>;
}

// Default demo users with known passwords for easy login
const DEFAULT_USERS: User[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@demo.com",
    password: "demo123", // Demo password
    avatar: "https://cdn-icons-png.flaticon.com/512/168/168730.png",
    bio: "Book enthusiast and aspiring writer. Passionate about science fiction and fantasy literature.",
    joinedDate: "January 2024",
    stats: { blogs: 4, reviews: 4, favorites: 3 }
  },
  {
    id: 2,
    name: "Emma Wilson",
    email: "emma@demo.com",
    password: "demo123",
    avatar: "https://cdn-icons-png.freepik.com/512/168/168725.png",
    bio: "Literary critic and avid reader. Love exploring different genres and sharing my thoughts.",
    joinedDate: "February 2024",
    stats: { blogs: 8, reviews: 15, favorites: 3 }
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael@demo.com",
    password: "demo123",
    avatar: "https://cdn-icons-png.flaticon.com/512/168/168726.png",
    bio: "Science fiction fan and technology writer. Always on the lookout for the next great read.",
    joinedDate: "March 2024",
    stats: { blogs: 6, reviews: 22, favorites: 7 }
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    bookTitle: "The Midnight Library",
    bookAuthor: "Matt Haig",
    coverImage: "https://m.media-amazon.com/images/I/41i24QnKhgL._SL500_.jpg",
    rating: 5,
    reviewTitle: "A Journey Through Infinite Possibilities",
    reviewText: "This book beautifully explores the concept of regret and the infinite possibilities that life offers. The writing is engaging and thought-provoking, making it impossible to put down. Matt Haig has created a masterpiece that challenges us to reconsider our choices and find meaning in our lives.",
    reviewPreview: "This book beautifully explores the concept of regret and the infinite possibilities that life offers. The writing is engaging and thought-provoking...",
    userId: 1,
    reviewerName: "Sarah Johnson",
    date: "2025-01-10",
    likes: 25,
    comments: 1,
    genre: "Fiction",
    isbn: "978-0525559474",
    commentsArray: [{
      id: 1767689324300,
      author: "Sarah Johnson",
      text: "This Book is Letally Very Good Loved It.!",
      date: "2026-01-06"
    }]
  },
  {
    id: 2,
    bookTitle: "Project Hail Mary",
    bookAuthor: "Andy Weir",
    coverImage: "https://m.media-amazon.com/images/I/51iIXx9XZ3L._SL500_.jpg",
    rating: 4,
    reviewTitle: "Science Fiction at Its Finest",
    reviewText: "Andy Weir delivers another masterpiece with Project Hail Mary. The scientific accuracy combined with humor makes this a must-read for any sci-fi enthusiast. The character development is exceptional and the plot keeps you hooked from start to finish.",
    reviewPreview: "Andy Weir delivers another masterpiece with Project Hail Mary. The scientific accuracy combined with humor makes this a must-read...",
    userId: 2,
    reviewerName: "Emma Wilson",
    date: "2025-01-08",
    likes: 18,
    comments: 1,
    genre: "Science Fiction",
    isbn: "978-0593135204",
    commentsArray: [{
      id: 1764681582285,
      author: "Emma Wilson",
      text: "My thoughts are this is a fiction.",
      date: "2025-12-02"
    }]
  },
  {
    id: 3,
    bookTitle: "The Seven Husbands of Evelyn Hugo",
    bookAuthor: "Taylor Jenkins Reid",
    coverImage: "https://assets.vogue.com/photos/62dadd5b903af959e205f745/1:1/w_1398,h_1398,c_limit/the-seven-husbands-of-evelyn-hugo-9781501161933_hr.jpeg",
    rating: 5,
    reviewTitle: "A Captivating Story of Love and Ambition",
    reviewText: "This novel takes you on an emotional rollercoaster through the life of a Hollywood icon. The character development is exceptional and the plot keeps you hooked. A beautifully written story about love, ambition, and the price of fame.",
    reviewPreview: "This novel takes you on an emotional rollercoaster through the life of a Hollywood icon. The character development is exceptional...",
    userId: 1,
    reviewerName: "Sarah Johnson",
    date: "2025-01-05",
    likes: 32,
    comments: 1,
    genre: "Fiction",
    isbn: "978-1501139239",
    commentsArray: [{
      id: 1764930059011,
      author: "Sarah Johnson",
      text: "what is thtis book name \nnot liking",
      date: "2025-12-05"
    }]
  },
  {
    id: 4,
    bookTitle: "Dune",
    bookAuthor: "Frank Herbert",
    coverImage: "https://i.etsystatic.com/16102212/r/il/2482ff/2771009725/il_fullxfull.2771009725_chlb.jpg",
    rating: 5,
    reviewTitle: "Epic Science Fiction Masterpiece",
    reviewText: "Dune remains one of the greatest science fiction novels ever written. The world-building is unparalleled, and the political intrigue is captivating from start to finish. A must-read for any sci-fi fan.",
    reviewPreview: "Dune remains one of the greatest science fiction novels ever written. The world-building is unparalleled, and the political intrigue is captivating...",
    userId: 3,
    reviewerName: "Michael Chen",
    date: "2025-01-05",
    likes: 45,
    comments: 15,
    genre: "Science Fiction",
    isbn: "978-0441013593"
  },
  {
    id: 5,
    bookTitle: "The Silent Patient",
    bookAuthor: "Alex Michaelides",
    coverImage: "https://m.media-amazon.com/images/I/91BbLCJOruL._AC_UF1000,1000_QL80_.jpg",
    rating: 4,
    reviewTitle: "A Psychological Thriller That Keeps You Guessing",
    reviewText: "This book had me on the edge of my seat from start to finish. The plot twists are expertly crafted and the ending is truly shocking. A perfect example of psychological thriller done right.",
    reviewPreview: "This book had me on the edge of my seat from start to finish. The plot twists are expertly crafted and the ending is truly shocking...",
    userId: 2,
    reviewerName: "Emma Wilson",
    date: "2024-12-28",
    likes: 28,
    comments: 9,
    genre: "Mystery",
    isbn: "978-1250301697"
  },
  {
    id: 6,
    bookTitle: "Educated",
    bookAuthor: "Tara Westover",
    coverImage: "https://m.media-amazon.com/images/I/41fkYRj1OwL._SL500_.jpg",
    rating: 5,
    reviewTitle: "A Powerful Memoir of Resilience",
    reviewText: "Tara Westover's journey from isolation to education is both heartbreaking and inspiring. This memoir will stay with you long after you finish reading. A testament to the power of education and determination.",
    reviewPreview: "Tara Westover's journey from isolation to education is both heartbreaking and inspiring. This memoir will stay with you long after you finish reading...",
    userId: 3,
    reviewerName: "Michael Chen",
    date: "2024-12-28",
    likes: 36,
    comments: 11,
    genre: "Biography",
    isbn: "978-0399590504"
  },
  {
    id: 7,
    bookTitle: "The Night Circus",
    bookAuthor: "Erin Morgenstern",
    coverImage: "https://m.media-amazon.com/images/I/81wHpiNObnL.jpg",
    rating: 5,
    reviewTitle: "Magical and Enchanting",
    reviewText: "A beautifully written novel that transports you to a world of magic and wonder. The descriptions are vivid and the story is utterly captivating. This book is pure magic from beginning to end.",
    reviewPreview: "A beautifully written novel that transports you to a world of magic and wonder. The descriptions are vivid and the story is utterly captivating...",
    userId: 1,
    reviewerName: "Sarah Johnson",
    date: "2024-12-25",
    likes: 42,
    comments: 14,
    genre: "Fantasy",
    isbn: "978-0307744432"
  },
  {
    id: 8,
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
    coverImage: "https://m.media-amazon.com/images/I/41wuB-s8vRL._SL500_.jpg",
    rating: 5,
    reviewTitle: "Practical Guide to Building Better Habits",
    reviewText: "An insightful book that provides actionable strategies for building good habits and breaking bad ones. Highly recommended for personal development. The science-backed approach makes it incredibly effective.",
    reviewPreview: "An insightful book that provides actionable strategies for building good habits and breaking bad ones. Highly recommended for personal development...",
    userId: 2,
    reviewerName: "Emma Wilson",
    date: "2024-12-20",
    likes: 58,
    comments: 18,
    genre: "Self-Help",
    isbn: "978-0735211292"
  },
  {
    id: 9,
    bookTitle: "The Power of Habit",
    bookAuthor: "Charles Duhigg",
    coverImage: "https://cdn.penguin.co.in/wp-content/uploads/2023/06/9781847946249.jpg",
    rating: 4,
    reviewTitle: "Understanding How Habits Work",
    reviewText: "A fascinating exploration of the science behind habits. Duhigg explains how habits form and how we can change them. Full of interesting case studies and practical insights.",
    reviewPreview: "A fascinating exploration of the science behind habits. Duhigg explains how habits form and how we can change them. Full of interesting case studies...",
    userId: 3,
    reviewerName: "Michael Chen",
    date: "2024-12-18",
    likes: 31,
    comments: 7,
    genre: "Self-Help",
    isbn: "978-0812981605"
  },
  {
    id: 10,
    bookTitle: "Deep Work",
    bookAuthor: "Cal Newport",
    coverImage: "https://m.media-amazon.com/images/I/61zt25yYrCL.jpg",
    rating: 5,
    reviewTitle: "Focus and Productivity Strategies That Actually Work",
    reviewText: "Cal Newport provides a compelling argument for the value of deep, focused work in an age of constant distraction. The strategies are practical and the examples are inspiring. A must-read for knowledge workers.",
    reviewPreview: "Cal Newport provides a compelling argument for the value of deep, focused work in an age of constant distraction. The strategies are practical...",
    userId: 1,
    reviewerName: "Sarah Johnson",
    date: "2024-12-15",
    likes: 47,
    comments: 13,
    genre: "Productivity",
    isbn: "978-1455586691"
  }
];

const DEFAULT_BLOGS: Blog[] = [
  {
    id: 1,
    title: "The Future of Reading: How Digital Platforms Are Transforming Literature",
    subtitle: "Exploring how modern technology is reshaping the way we consume and interact with books, and what this means for readers and authors alike.",
    content: "The way we read has fundamentally changed over the past two decades. What once required a trip to the library or bookstore now happens instantly on our devices. But this shift is about more than convenience—it's reshaping how we discover, consume, and engage with literature.\n\nDigital platforms have democratized access to books in unprecedented ways. E-readers, audiobooks, and online libraries have made literature accessible to millions who previously faced barriers. This accessibility isn't just about geography or economics; it's about breaking down the walls that once separated readers from stories.\n\n## The Rise of Interactive Reading\n\nOne of the most exciting developments is the emergence of interactive reading experiences. Platforms now allow readers to highlight passages, share quotes instantly, and engage in discussions without leaving the book. This transforms reading from a solitary activity into a connected, social experience.\n\nThe ability to annotate and discuss in real-time creates a new layer of engagement. Readers can see what others found meaningful, discover new perspectives, and build communities around shared interests.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678004/1_ob5tq4.jpg",
    authorId: 1,
    authorName: "Sarah Johnson",
    category: "Technology",
    tags: ["Technology", "Reading", "Digital", "Literature", "Innovation"],
    date: "2025-01-10",
    readTime: "8 min read",
    claps: 245,
    comments: 18,
    shares: 32
  },
  {
    id: 2,
    title: "10 Books That Changed My Perspective on Life",
    subtitle: "A personal journey through literature that transformed my understanding of the world and myself.",
    content: "Over the years, certain books have fundamentally shifted how I see the world. These aren't just good books—they're transformative experiences that changed my perspective on life, relationships, and what it means to be human.\n\nFrom fiction that opened my eyes to different cultures and experiences, to non-fiction that challenged my assumptions, each of these books left an indelible mark on my thinking.\n\n## The Power of Story\n\nStories have a unique ability to transport us into other people's lives and experiences. Through fiction, we can walk in someone else's shoes, see the world through their eyes, and develop empathy for perspectives we might never encounter in our daily lives.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678002/2_ec4ty1.jpg",
    authorId: 2,
    authorName: "Emma Wilson",
    category: "Personal",
    tags: ["Books", "Personal Growth", "Reading", "Life Lessons"],
    date: "2025-01-08",
    readTime: "6 min read",
    claps: 189,
    comments: 12,
    shares: 25
  },
  {
    id: 3,
    title: "Why Reading Fiction Makes You More Empathetic",
    subtitle: "Scientific research reveals the profound impact of fiction on our emotional intelligence and social understanding.",
    content: "Recent studies in neuroscience and psychology have shown that reading fiction doesn't just entertain us—it actually changes our brains in ways that make us more empathetic and socially aware.\n\nWhen we read fiction, our brains don't just process words on a page. We're actively constructing mental models of characters, their motivations, their emotions, and their relationships. This mental exercise strengthens the same neural pathways we use to understand real people in our daily lives.\n\n## The Science Behind Empathy\n\nBrain imaging studies have found that when people read about characters experiencing emotions, the same brain regions light up as when they experience those emotions themselves. This suggests that reading fiction is a form of mental practice for real-world empathy.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678001/3_pbkuz2.jpg",
    authorId: 3,
    authorName: "Michael Chen",
    category: "Science",
    tags: ["Science", "Psychology", "Fiction", "Empathy", "Research"],
    date: "2025-01-05",
    readTime: "10 min read",
    claps: 313,
    comments: 24,
    shares: 41
  },
  {
    id: 4,
    title: "The Art of Slow Reading in a Fast World",
    subtitle: "In an age of information overload, learning to read deeply is more important than ever.",
    content: "We live in an era of constant information bombardment. Social media feeds, news alerts, and endless content streams compete for our attention. In this fast-paced environment, the art of slow, deep reading has become a rare and valuable skill.\n\nSlow reading isn't about reading slowly for its own sake—it's about reading with intention, attention, and reflection. It's about giving a text the time and mental space it deserves to fully unfold its meaning and impact.\n\n## The Benefits of Deep Reading\n\nWhen we read slowly and deeply, we engage more fully with the text. We notice nuances, make connections, and develop a richer understanding. This type of reading strengthens our critical thinking skills and improves our ability to focus.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678006/4_ba0dvh.png",
    authorId: 1,
    authorName: "Sarah Johnson",
    category: "Lifestyle",
    tags: ["Reading", "Mindfulness", "Focus", "Lifestyle"],
    date: "2025-01-03",
    readTime: "7 min read",
    claps: 156,
    comments: 9,
    shares: 18
  },
  {
    id: 5,
    title: "The Best Book Recommendations from 2024",
    subtitle: "A curated list of must-read books that captured our attention this year.",
    content: "As we reflect on the year that was, it's time to celebrate the books that stood out. From groundbreaking fiction to insightful non-fiction, 2024 delivered some truly exceptional reads.\n\nThis list represents the books that not only entertained us but also challenged our thinking, expanded our perspectives, and left a lasting impression. Whether you're looking for your next great read or want to catch up on what you might have missed, these recommendations won't disappoint.\n\n## Fiction Highlights\n\nThe fiction landscape this year was particularly strong, with authors exploring themes of identity, technology, and human connection in innovative ways.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678002/5_pupf7f.jpg",
    authorId: 2,
    authorName: "Emma Wilson",
    category: "Recommendations",
    tags: ["Recommendations", "2024", "Books", "Best Of"],
    date: "2024-12-30",
    readTime: "12 min read",
    claps: 421,
    comments: 35,
    shares: 58
  },
  {
    id: 6,
    title: "Understanding Different Literary Genres: A Beginner's Guide",
    subtitle: "Breaking down the major genres and what makes each one unique.",
    content: "For new readers, the world of literature can feel overwhelming. With so many genres and subgenres, it's hard to know where to start. This guide will help you understand the major literary genres and what makes each one special.\n\nFrom the imaginative worlds of fantasy to the grounded reality of literary fiction, each genre offers something unique. Understanding these differences can help you find books you'll love and expand your reading horizons.\n\n## Fiction vs. Non-Fiction\n\nThe first major division in literature is between fiction and non-fiction. Fiction tells stories that are invented by the author, while non-fiction presents factual information about real events, people, or ideas.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678003/6_vtfx1w.jpg",
    authorId: 3,
    authorName: "Michael Chen",
    category: "Education",
    tags: ["Education", "Genres", "Guide", "Reading"],
    date: "2024-12-28",
    readTime: "9 min read",
    claps: 203,
    comments: 15,
    shares: 22
  },
  {
    id: 7,
    title: "How Book Clubs Can Transform Your Reading Experience",
    subtitle: "The benefits of reading in community and how to start your own book club.",
    content: "Reading is often seen as a solitary activity, but it doesn't have to be. Book clubs offer a way to share the reading experience with others, creating deeper engagement with books and building meaningful connections with fellow readers.\n\nWhen you discuss a book with others, you discover perspectives you might have missed, interpretations you hadn't considered, and connections you didn't see. This collaborative exploration enriches your understanding and appreciation of the text.\n\n## The Benefits of Reading Together\n\nBook clubs provide accountability, motivation, and community. They encourage you to read books you might not have picked up on your own, and they help you get more out of every book you read.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678002/7_hefrtl.jpg",
    authorId: 1,
    authorName: "Sarah Johnson",
    category: "Community",
    tags: ["Book Clubs", "Community", "Reading", "Social"],
    date: "2024-12-25",
    readTime: "6 min read",
    claps: 167,
    comments: 11,
    shares: 19
  },
  {
    id: 8,
    title: "The Impact of Book-to-Screen Adaptations",
    subtitle: "Analyzing how books translate to visual media and what gets lost (or gained) in translation.",
    content: "In recent years, we've seen an explosion of book-to-screen adaptations. From streaming series to blockbuster films, beloved books are finding new life on screen. But how do these adaptations compare to their source material?\n\nAdapting a book for screen is a complex process that involves translating written narrative into visual storytelling. Some elements translate beautifully, while others inevitably get lost or transformed. Understanding these differences can help us appreciate both formats for what they are.\n\n## What Makes a Good Adaptation\n\nThe best adaptations don't try to replicate the book exactly—they capture its essence while embracing the unique strengths of visual storytelling. They understand that what works on the page might not work on screen, and vice versa.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678001/8_gnzhlv.jpg",
    authorId: 2,
    authorName: "Emma Wilson",
    category: "Entertainment",
    tags: ["Adaptations", "Entertainment", "Media", "Books"],
    date: "2024-12-22",
    readTime: "11 min read",
    claps: 298,
    comments: 22,
    shares: 34
  },
  {
    id: 9,
    title: "Building a Personal Library: Tips and Tricks",
    subtitle: "How to curate a collection of books that reflects your interests and grows with you.",
    content: "A personal library is more than just a collection of books—it's a reflection of your interests, your journey, and your intellectual growth. Building a meaningful library takes time, intention, and a bit of strategy.\n\nWhether you're just starting out or looking to refine an existing collection, these tips will help you build a library that serves you well for years to come.\n\n## Start with Your Interests\n\nThe best personal libraries are built around genuine interests and passions. Start by identifying the topics, genres, and authors that truly excite you. Your library should reflect who you are and who you're becoming.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678003/9_kzvrxx.jpg",
    authorId: 3,
    authorName: "Michael Chen",
    category: "Lifestyle",
    tags: ["Library", "Books", "Collection", "Lifestyle"],
    date: "2024-12-20",
    readTime: "8 min read",
    claps: 134,
    comments: 8,
    shares: 15
  },
  {
    id: 10,
    title: "The Science Behind Why We Love Stories",
    subtitle: "Exploring the psychological and neurological reasons why humans are drawn to narrative.",
    content: "Humans have been telling stories for thousands of years. From cave paintings to novels to films, storytelling is one of our most fundamental and universal activities. But why are we so drawn to stories?\n\nRecent research in neuroscience and psychology has revealed fascinating insights into how our brains process and respond to narratives. Understanding this science can help us appreciate why stories have such power over us.\n\n## The Neuroscience of Storytelling\n\nWhen we hear or read a story, our brains don't just process it as information. Multiple brain regions activate, including those responsible for language, sensory processing, and emotion. This widespread activation helps explain why stories feel so immersive and memorable.",
    thumbnail: "https://res.cloudinary.com/deqnohf2h/image/upload/v1764678006/10_dqlrku.jpg",
    authorId: 1,
    authorName: "Sarah Johnson",
    category: "Science",
    tags: ["Science", "Psychology", "Stories", "Neuroscience"],
    date: "2024-12-18",
    readTime: "9 min read",
    claps: 267,
    comments: 19,
    shares: 28
  }
];

const DEFAULT_GENRES: Genre[] = [
  { id: 1, name: "Fiction", slug: "fiction" },
  { id: 2, name: "Science Fiction", slug: "science-fiction" },
  { id: 3, name: "Mystery", slug: "mystery" },
  { id: 4, name: "Biography", slug: "biography" },
  { id: 5, name: "Fantasy", slug: "fantasy" },
  { id: 6, name: "Self-Help", slug: "self-help" },
  { id: 7, name: "Productivity", slug: "productivity" }
];

const DEFAULT_FAVORITES: Favorite[] = [
  { id: 1, userId: 1, type: "review", itemId: 4 },
  { id: 2, userId: 1, type: "blog", itemId: 3 },
  { id: 3, userId: 1, type: "review", itemId: 7 },
  { id: 4, userId: 2, type: "blog", itemId: 5 },
  { id: 5, userId: 2, type: "review", itemId: 8 },
  { id: 6, userId: 3, type: "blog", itemId: 1 },
  { id: 7, userId: 3, type: "review", itemId: 10 }
];

const STORAGE_KEY = 'bookreview_static_data';

class StaticDataStore {
  private data: DataStore;

  constructor() {
    this.data = this.loadFromStorage();
    this.initializeDefaults();
    this.saveToStorage();
  }

  private loadFromStorage(): DataStore {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all required fields exist
        return {
          users: parsed.users || DEFAULT_USERS,
          reviews: parsed.reviews || DEFAULT_REVIEWS,
          blogs: parsed.blogs || DEFAULT_BLOGS,
          favorites: parsed.favorites || DEFAULT_FAVORITES,
          genres: parsed.genres || DEFAULT_GENRES,
          follows: parsed.follows || []
        };
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
    return {
      users: [...DEFAULT_USERS],
      reviews: [...DEFAULT_REVIEWS],
      blogs: [...DEFAULT_BLOGS],
      favorites: [...DEFAULT_FAVORITES],
      genres: [...DEFAULT_GENRES],
      follows: []
    };
  }

  private initializeDefaults() {
    // Ensure default users always exist (for demo login)
    const defaultUserEmails = DEFAULT_USERS.map(u => u.email);
    this.data.users = this.data.users.filter(u => !defaultUserEmails.includes(u.email));
    this.data.users = [...DEFAULT_USERS, ...this.data.users];
    
    // Ensure default genres exist
    const defaultGenreNames = DEFAULT_GENRES.map(g => g.name);
    this.data.genres = this.data.genres.filter(g => !defaultGenreNames.includes(g.name));
    this.data.genres = [...DEFAULT_GENRES, ...this.data.genres];
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Generic query helper
  private query<T>(collection: keyof DataStore, query?: string): T[] {
    const items = this.data[collection] as unknown as any[];
    if (!query) return [...items] as unknown as T[];

    // Parse query string (e.g., "userId=1&type=review")
    const params = new URLSearchParams(query);
    let filtered = [...items];

    params.forEach((value, key) => {
      if (key.endsWith('_like')) {
        // Partial match
        const field = key.replace('_like', '');
        filtered = filtered.filter((item: any) => 
          String(item[field] || '').toLowerCase().includes(value.toLowerCase())
        );
      } else {
        // Exact match
        filtered = filtered.filter((item: any) => {
          const itemValue = item[key];
          if (itemValue === undefined || itemValue === null) return false;
          
          // Handle numeric comparisons
          if (typeof itemValue === 'number' || (typeof itemValue === 'string' && !isNaN(Number(itemValue)))) {
            const numValue = Number(value);
            const numItem = Number(itemValue);
            if (!isNaN(numValue) && !isNaN(numItem)) {
              return numItem === numValue;
            }
          }
          
          // String comparison
          return String(itemValue).toLowerCase() === value.toLowerCase();
        });
      }
    });

    return filtered as unknown as T[];
  }

  // Generic get by ID
  private getById<T extends { id: number | string }>(collection: keyof DataStore, id: number | string): T | null {
    const items = this.data[collection] as unknown as T[];
    const item = items.find(i => {
      const itemId = typeof i.id === 'number' ? i.id : parseInt(i.id) || i.id;
      const searchId = typeof id === 'number' ? id : parseInt(id) || id;
      return String(itemId) === String(searchId);
    });
    return item ? { ...item } : null;
  }

  // Generic create
  private create<T extends { id: number | string }>(collection: keyof DataStore, item: Omit<T, 'id'>): T {
    const items = this.data[collection] as unknown as T[];
    const maxId = items.reduce((max, i) => {
      const id = typeof i.id === 'string' ? parseInt(i.id) || 0 : (typeof i.id === 'number' ? i.id : 0);
      return Math.max(max, id);
    }, 0);
    const newItem = { ...item, id: maxId + 1 } as T;
    items.push(newItem);
    this.saveToStorage();
    return { ...newItem };
  }

  // Generic update
  private update<T extends { id: number | string }>(collection: keyof DataStore, id: number | string, updates: Partial<T>): T | null {
    const items = this.data[collection] as unknown as T[];
    const index = items.findIndex(i => {
      const itemId = typeof i.id === 'number' ? i.id : parseInt(i.id) || i.id;
      const searchId = typeof id === 'number' ? id : parseInt(id) || id;
      return String(itemId) === String(searchId);
    });
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates } as T;
    this.saveToStorage();
    return { ...items[index] };
  }

  // Generic delete
  private delete(collection: keyof DataStore, id: number | string): boolean {
    const items = this.data[collection] as any[];
    const index = items.findIndex(i => {
      const itemId = typeof i.id === 'number' ? i.id : parseInt(i.id) || i.id;
      const searchId = typeof id === 'number' ? id : parseInt(id) || id;
      return String(itemId) === String(searchId);
    });
    if (index === -1) return false;
    items.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Public API methods
  getUsers(query?: string): User[] {
    return this.query<User>('users', query);
  }

  getUserById(id: number): User | null {
    return this.getById<User>('users', id);
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  createUser(user: Omit<User, 'id'>): User {
    return this.create<User>('users', user);
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    return this.update<User>('users', id, updates);
  }

  getReviews(query?: string): Review[] {
    return this.query<Review>('reviews', query);
  }

  getReviewById(id: number | string): Review | null {
    return this.getById<Review>('reviews', id);
  }

  createReview(review: Omit<Review, 'id'>): Review {
    return this.create<Review>('reviews', review);
  }

  updateReview(id: number | string, updates: Partial<Review>): Review | null {
    return this.update<Review>('reviews', id, updates);
  }

  deleteReview(id: number | string): boolean {
    return this.delete('reviews', id);
  }

  getBlogs(query?: string): Blog[] {
    return this.query<Blog>('blogs', query);
  }

  getBlogById(id: number | string): Blog | null {
    return this.getById<Blog>('blogs', id);
  }

  createBlog(blog: Omit<Blog, 'id'>): Blog {
    return this.create<Blog>('blogs', blog);
  }

  updateBlog(id: number | string, updates: Partial<Blog>): Blog | null {
    return this.update<Blog>('blogs', id, updates);
  }

  deleteBlog(id: number | string): boolean {
    return this.delete('blogs', id);
  }

  getFavorites(query?: string): Favorite[] {
    return this.query<Favorite>('favorites', query);
  }

  createFavorite(favorite: Omit<Favorite, 'id'>): Favorite {
    return this.create<Favorite>('favorites', favorite);
  }

  deleteFavorite(id: number): boolean {
    return this.delete('favorites', id);
  }

  getGenres(): Genre[] {
    return this.query<Genre>('genres');
  }

  getFollows(query?: string): Array<{ id: number; followerId: number; followingId: number }> {
    return this.query<{ id: number; followerId: number; followingId: number }>('follows', query);
  }

  createFollow(follow: Omit<{ id: number; followerId: number; followingId: number }, 'id'>): { id: number; followerId: number; followingId: number } {
    return this.create<{ id: number; followerId: number; followingId: number }>('follows', follow);
  }

  deleteFollow(id: number): boolean {
    return this.delete('follows', id);
  }
}

export const staticDataStore = new StaticDataStore();

