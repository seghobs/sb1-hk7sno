import express from 'express';
import cors from 'cors';
import Database from '@better-sqlite3/better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const db = new Database('database.db');

app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    profileImage TEXT,
    bio TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    image TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    postId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (postId) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    postId INTEGER,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (postId) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER,
    receiverId INTEGER,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users(id),
    FOREIGN KEY (receiverId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    followerId INTEGER,
    followingId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (followerId) REFERENCES users(id),
    FOREIGN KEY (followingId) REFERENCES users(id)
  );
`);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, hashedPassword);
    
    const token = jwt.sign({ id: result.lastInsertRowid, username }, 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = stmt.get(username);
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, username }, 'your-secret-key');
  res.json({ token });
});

// Posts routes
app.get('/api/posts', authenticateToken, (req, res) => {
  const stmt = db.prepare(`
    SELECT 
      p.*,
      u.username,
      u.profileImage,
      COUNT(DISTINCT l.id) as likesCount,
      COUNT(DISTINCT c.id) as commentsCount
    FROM posts p
    JOIN users u ON p.userId = u.id
    LEFT JOIN likes l ON p.id = l.postId
    LEFT JOIN comments c ON p.id = c.postId
    GROUP BY p.id
    ORDER BY p.createdAt DESC
  `);
  
  const posts = stmt.all();
  res.json(posts);
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { content, image } = req.body;
  const stmt = db.prepare('INSERT INTO posts (userId, content, image) VALUES (?, ?, ?)');
  const result = stmt.run(req.user.id, content, image);
  
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.json(post);
});

// Stories routes
app.get('/api/stories', authenticateToken, (req, res) => {
  const stmt = db.prepare(`
    SELECT s.*, u.username, u.profileImage
    FROM stories s
    JOIN users u ON s.userId = u.id
    WHERE s.createdAt >= datetime('now', '-24 hours')
    ORDER BY s.createdAt DESC
  `);
  
  const stories = stmt.all();
  res.json(stories);
});

app.post('/api/stories', authenticateToken, (req, res) => {
  const { content } = req.body;
  const stmt = db.prepare('INSERT INTO stories (userId, content) VALUES (?, ?)');
  const result = stmt.run(req.user.id, content);
  
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(result.lastInsertRowid);
  res.json(story);
});

// Messages routes
app.get('/api/conversations', authenticateToken, (req, res) => {
  const stmt = db.prepare(`
    SELECT DISTINCT 
      u.id, u.username, u.profileImage,
      (SELECT content FROM messages 
       WHERE (senderId = ? AND receiverId = u.id) 
          OR (senderId = u.id AND receiverId = ?)
       ORDER BY createdAt DESC LIMIT 1) as lastMessage
    FROM messages m
    JOIN users u ON u.id = CASE 
      WHEN m.senderId = ? THEN m.receiverId 
      ELSE m.senderId 
    END
    WHERE m.senderId = ? OR m.receiverId = ?
  `);
  
  const conversations = stmt.all(
    req.user.id, 
    req.user.id, 
    req.user.id, 
    req.user.id, 
    req.user.id
  );
  
  res.json(conversations);
});

app.get('/api/messages/:userId', authenticateToken, (req, res) => {
  const stmt = db.prepare(`
    SELECT m.*, u.username, u.profileImage
    FROM messages m
    JOIN users u ON m.senderId = u.id
    WHERE (senderId = ? AND receiverId = ?) 
       OR (senderId = ? AND receiverId = ?)
    ORDER BY m.createdAt DESC
    LIMIT 50
  `);
  
  const messages = stmt.all(
    req.user.id, 
    req.params.userId, 
    req.params.userId, 
    req.user.id
  );
  
  res.json(messages);
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { receiverId, content } = req.body;
  const stmt = db.prepare('INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)');
  const result = stmt.run(req.user.id, receiverId, content);
  
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.json(message);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});