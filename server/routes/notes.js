import express from 'express';
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

// GET /api/notes - Get notes with filtering, sorting, search
router.get('/', async (req, res) => {
  try {
    const { q, folder, tag, sort, includeDeleted } = req.query;
    let filter = { userId: req.user.id };

    if (includeDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }

    if (folder !== undefined) {
      filter.folder = folder;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ title: regex }, { body: regex }];
    }

    let sortOption;
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'title_asc':
        sortOption = { title: 1 };
        break;
      case 'title_desc':
        sortOption = { title: -1 };
        break;
      case 'updated':
        sortOption = { updatedAt: -1 };
        break;
      default:
        sortOption = { isPinned: -1, createdAt: -1 };
    }

    const notes = await Note.find(filter).sort(sortOption);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// GET /api/notes/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { period } = req.query;

    // Determine date range
    let dateFilter = {};
    const now = new Date();
    if (period === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === '7days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === '30days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      dateFilter = { createdAt: { $gte: start } };
    }

    const baseFilter = { userId, isDeleted: { $ne: true }, ...dateFilter };

    // Total notes
    const totalNotes = await Note.countDocuments(baseFilter);

    // Favorites count
    const totalFavorites = await Note.countDocuments({ ...baseFilter, favorite: true });

    // Pinned count
    const totalPinned = await Note.countDocuments({ ...baseFilter, isPinned: true });

    // Notes created this week
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const notesThisWeek = await Note.countDocuments({
      userId,
      isDeleted: { $ne: true },
      createdAt: { $gte: weekStart },
    });

    // Category distribution
    const categoryDistribution = await Note.aggregate([
      { $match: baseFilter },
      { $group: { _id: { $ifNull: ['$folder', 'Uncategorized'] }, count: { $sum: 1 } } },
      { $project: { name: { $cond: [{ $eq: ['$_id', ''] }, 'Uncategorized', '$_id'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Notes created over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const notesOverTime = await Note.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true }, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ]);

    // Daily activity (notes by day of week)
    const dailyActivity = await Note.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyActivityFormatted = dayNames.map((name, i) => {
      const found = dailyActivity.find((d) => d._id === i + 1);
      return { day: name, count: found ? found.count : 0 };
    });

    // Word count analytics
    const wordCountData = await Note.aggregate([
      { $match: baseFilter },
      {
        $project: {
          wordCount: {
            $size: {
              $split: [{ $trim: { input: { $ifNull: ['$body', ''] } } }, ' '],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalWords: { $sum: '$wordCount' },
          avgWords: { $avg: '$wordCount' },
          maxWords: { $max: '$wordCount' },
        },
      },
    ]);
    const wordStats = wordCountData[0] || { totalWords: 0, avgWords: 0, maxWords: 0 };

    // Recently active notes (last 5 updated)
    const recentNotes = await Note.find({ userId, isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title folder updatedAt');

    // Tags usage
    const tagUsage = await Note.aggregate([
      { $match: baseFilter },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      totalNotes,
      totalFavorites,
      totalPinned,
      notesThisWeek,
      categoryDistribution,
      notesOverTime,
      dailyActivity: dailyActivityFormatted,
      wordStats: {
        totalWords: Math.round(wordStats.totalWords),
        avgWords: Math.round(wordStats.avgWords),
        maxWords: Math.round(wordStats.maxWords),
      },
      recentNotes,
      tagUsage,
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// GET /api/notes/folders - Get distinct folder names
router.get('/folders', async (req, res) => {
  try {
    const folders = await Note.distinct('folder', {
      userId: req.user.id,
      isDeleted: { $ne: true },
    });
    res.json(folders.filter((f) => f !== ''));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch folders' });
  }
});

// DELETE /api/notes/folders/:name - Delete a folder (unsets folder from all notes in it)
router.delete('/folders/:name', async (req, res) => {
  try {
    const folderName = decodeURIComponent(req.params.name);
    await Note.updateMany(
      { userId: req.user.id, folder: folderName },
      { $set: { folder: '' } }
    );
    res.json({ message: `Folder "${folderName}" deleted` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete folder' });
  }
});

// GET /api/notes/tags - Get distinct tag names
router.get('/tags', async (req, res) => {
  try {
    const tags = await Note.distinct('tags', {
      userId: req.user.id,
      isDeleted: { $ne: true },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, body, folder, tags } = req.body;
    const note = await Note.create({
      title,
      body,
      folder: folder || '',
      tags: tags || [],
      userId: req.user.id,
    });
    res.status(201).json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, body, folder, tags } = req.body;
    const updateData = { title, body };
    if (folder !== undefined) updateData.folder = folder;
    if (tags !== undefined) updateData.tags = tags;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// PATCH /api/notes/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: { $ne: true },
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.favorite = !note.favorite;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

// PATCH /api/notes/:id/pin - Toggle pin
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: { $ne: true },
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
});

// PATCH /api/notes/:id/restore - Restore from trash
router.patch('/:id/restore', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { returnDocument: 'after' }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found in trash' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore note' });
  }
});

// DELETE /api/notes/:id - Soft delete (move to trash)
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// DELETE /api/notes/:id/permanent - Permanently delete from trash
router.delete('/:id/permanent', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: true,
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found in trash' });
    }
    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to permanently delete note' });
  }
});

export default router;
