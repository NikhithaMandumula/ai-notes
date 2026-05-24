import express from 'express';
import { z } from 'zod';
import SharedNote from '../models/SharedNote.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendShareNotificationEmail } from '../utils/email.js';

const router = express.Router();
router.use(auth);

const createShareSchema = z.object({
  noteId: z.string({ required_error: 'Note ID is required' }).min(1, 'Note ID is required'),
  toEmail: z.string({ required_error: 'Recipient email is required' }).email('Invalid email format'),
});

// POST /api/shares — Share a note with a user by email
router.post('/', validate(createShareSchema), async (req, res) => {
  try {
    const { noteId, toEmail } = req.body;

    // Verify note exists and belongs to current user
    const note = await Note.findOne({ _id: noteId, userId: req.user.id, isDeleted: { $ne: true } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Find recipient by email
    const toUser = await User.findOne({ email: toEmail.toLowerCase().trim() });
    if (!toUser) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Prevent self-sharing
    if (toUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot share a note with yourself' });
    }

    // Create the share
    const share = await SharedNote.create({
      noteId,
      fromUserId: req.user.id,
      toUserId: toUser._id,
    });

    // Populate for response and socket event
    const populated = await SharedNote.findById(share._id)
      .populate('noteId', 'title body folder tags')
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    // Emit real-time notification to recipient
    const io = req.app.get('io');
    if (io) {
      io.to(toUser._id.toString()).emit('note:received', populated);
    }

    // Send email notification (non-blocking — don't fail the share if email fails)
    sendShareNotificationEmail({
      toEmail: populated.toUserId.email,
      fromName: populated.fromUserId.name,
      noteTitle: populated.noteId.title,
    }).catch((err) => console.error('Share notification email failed:', err.message));

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This note has already been shared with that user' });
    }
    res.status(500).json({ message: 'Failed to share note' });
  }
});

// GET /api/shares/sent — Get all notes the current user has shared
router.get('/sent', async (req, res) => {
  try {
    const shares = await SharedNote.find({ fromUserId: req.user.id })
      .populate('noteId', 'title body folder tags')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(shares);
  } catch (error) {
    console.error('Fetch sent shares error:', error);
    res.status(500).json({ message: 'Failed to fetch sent shares' });
  }
});

// GET /api/shares/received — Get all notes shared with the current user
router.get('/received', async (req, res) => {
  try {
    const shares = await SharedNote.find({ toUserId: req.user.id })
      .populate('noteId', 'title body folder tags')
      .populate('fromUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(shares);
  } catch (error) {
    console.error('Fetch received shares error:', error);
    res.status(500).json({ message: 'Failed to fetch received shares' });
  }
});

// GET /api/shares/received/count — Count of pending received shares
router.get('/received/count', async (req, res) => {
  try {
    const count = await SharedNote.countDocuments({ toUserId: req.user.id, status: 'pending' });
    res.json({ count });
  } catch (error) {
    console.error('Fetch share count error:', error);
    res.status(500).json({ message: 'Failed to fetch share count' });
  }
});

// PATCH /api/shares/:id/accept — Accept a received share
router.patch('/:id/accept', async (req, res) => {
  try {
    const share = await SharedNote.findOneAndUpdate(
      { _id: req.params.id, toUserId: req.user.id },
      { status: 'accepted' },
      { returnDocument: 'after' }
    )
      .populate('noteId', 'title body folder tags')
      .populate('fromUserId', 'name email');

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    res.json(share);
  } catch (error) {
    console.error('Accept share error:', error);
    res.status(500).json({ message: 'Failed to accept share' });
  }
});

// PATCH /api/shares/:id/dismiss — Dismiss a received share
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const share = await SharedNote.findOneAndUpdate(
      { _id: req.params.id, toUserId: req.user.id },
      { status: 'dismissed' },
      { returnDocument: 'after' }
    )
      .populate('noteId', 'title body folder tags')
      .populate('fromUserId', 'name email');

    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }
    res.json(share);
  } catch (error) {
    console.error('Dismiss share error:', error);
    res.status(500).json({ message: 'Failed to dismiss share' });
  }
});

export default router;
