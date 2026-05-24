import express from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import User from '../models/User.js';

const updateProfileSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().default(''),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(auth);

// Profile picture upload setup
const profilePicDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
if (!fs.existsSync(profilePicDir)) {
  fs.mkdirSync(profilePicDir, { recursive: true });
}

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profilePicDir),
  filename: (req, file, cb) =>
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
});

const profilePicUpload = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email bio profilePicture createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile
router.put('/', validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), bio: (bio || '').trim() },
      { new: true, runValidators: true }
    ).select('name email bio profilePicture createdAt');

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      profilePicture: user.profilePicture || '',
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/profile/picture
router.post(
  '/picture',
  (req, res, next) => {
    profilePicUpload.single('profilePicture')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Image too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded or unsupported format.' });
    }

    try {
      const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;

      // Delete old profile picture if it exists
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', user.profilePicture);
        fs.unlink(oldPath, () => {});
      }

      user.profilePicture = imageUrl;
      await user.save();

      res.json({ profilePicture: imageUrl });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/profile/picture
router.delete('/picture', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', user.profilePicture);
      fs.unlink(oldPath, () => {});
    }

    user.profilePicture = '';
    await user.save();

    res.json({ message: 'Profile picture removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
