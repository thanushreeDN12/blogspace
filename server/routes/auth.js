import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { ah } from '../utils/helpers.js';

const router = Router();

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email });

router.post(
  '/register',
  ah(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (username.trim().length < 3)
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });
    if (exists) return res.status(400).json({ message: 'Username or email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.trim(), email, password: hash });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  ah(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

router.get(
  '/me',
  auth,
  ah(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  })
);

export default router;
