import { Router } from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { ah, removeFile } from '../utils/helpers.js';

const router = Router();

// list posts (supports ?search= and ?author=)
router.get(
  '/',
  ah(async (req, res) => {
    const { search, author } = req.query;
    const filter = {};
    if (author) filter.author = author;
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { content: rx }];
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 }).populate('author', 'username');
    res.json(posts);
  })
);

router.get(
  '/:id',
  ah(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  })
);

router.post(
  '/',
  auth,
  upload.single('image'),
  ah(async (req, res) => {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      if (req.file) removeFile('/uploads/' + req.file.filename);
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const post = await Post.create({
      title: title.trim(),
      content,
      image: req.file ? '/uploads/' + req.file.filename : '',
      author: req.userId,
    });
    await post.populate('author', 'username');
    res.status(201).json(post);
  })
);

router.put(
  '/:id',
  auth,
  upload.single('image'),
  ah(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) {
      if (req.file) removeFile('/uploads/' + req.file.filename);
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { title, content, removeImage } = req.body;
    if (title?.trim()) post.title = title.trim();
    if (content?.trim()) post.content = content;

    if (req.file) {
      removeFile(post.image);
      post.image = '/uploads/' + req.file.filename;
    } else if (removeImage === 'true') {
      removeFile(post.image);
      post.image = '';
    }
    await post.save();
    await post.populate('author', 'username');
    res.json(post);
  })
);

router.delete(
  '/:id',
  auth,
  ah(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ message: 'Not allowed' });
    removeFile(post.image);
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  })
);

// ---- comments on a post ----
router.get(
  '/:id/comments',
  ah(async (req, res) => {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(comments);
  })
);

router.post(
  '/:id/comments',
  auth,
  ah(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({ text: text.trim(), post: post._id, author: req.userId });
    await comment.populate('author', 'username');
    res.status(201).json(comment);
  })
);

export default router;
