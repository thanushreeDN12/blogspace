import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// central error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' });
  if (err.name === 'MulterError') return res.status(400).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // drop leftover indexes (e.g. old unique "slug_1") that don't exist in our schemas
    for (const Model of [User, Post, Comment]) {
      try {
        await Model.syncIndexes();
      } catch (e) {
        console.warn(`Index sync skipped for ${Model.modelName}:`, e.message);
      }
    }
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
