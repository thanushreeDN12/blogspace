import { Router } from 'express';
import Comment from '../models/Comment.js';
import auth from '../middleware/auth.js';
import { ah } from '../utils/helpers.js';

const router = Router();

router.delete(
  '/:id',
  auth,
  ah(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.userId)
      return res.status(403).json({ message: 'Not allowed' });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  })
);

export default router;
