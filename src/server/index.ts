import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../db';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

// Authentication middleware
const auth = (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Please authenticate');
  }
};

// Auth routes
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    
    const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(username, email, hashedPassword);
    
    const token = jwt.sign({ id: result.lastInsertRowid }, JWT_SECRET);
    res.status(201).send({ token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Protected routes
app.post('/posts', auth, (req, res) => {
  try {
    const { content, image } = req.body;
    const stmt = db.prepare('INSERT INTO posts (userId, content, image) VALUES (?, ?, ?)');
    const result = stmt.run(req.user.id, content, image);
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/stories', auth, (req, res) => {
  try {
    const { content } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const stmt = db.prepare('INSERT INTO stories (userId, content, expiresAt) VALUES (?, ?, ?)');
    const result = stmt.run(req.user.id, content, expiresAt.toISOString());
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});