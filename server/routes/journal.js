const express = require('express');
const { body, query, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const { requireConsent } = require('../middleware/auth');

const router = express.Router();

// GET /api/journal - Get user's journal entries
router.get('/',
  requireConsent,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1-50'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build query
      const query = { userId: req.user._id };
      
      if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
      }

      const entries = await JournalEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-analytics -__v');

      const total = await JournalEntry.countDocuments(query);

      res.json({
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Journal fetch error:', error);
      res.status(500).json({ message: 'Error fetching journal entries' });
    }
  }
);

// POST /api/journal - Create new journal entry
router.post('/',
  requireConsent,
  [
    body('content').notEmpty().isLength({ max: 5000 }).withMessage('Content is required and must be less than 5000 characters'),
    body('mood.scale').isInt({ min: 1, max: 10 }).withMessage('Mood scale must be between 1-10'),
    body('mood.tags').optional().isArray().withMessage('Mood tags must be an array'),
    body('mood.colors').optional().isArray().withMessage('Mood colors must be an array'),
    body('context.location').optional().isIn(['campus', 'dorm', 'library', 'outdoors', 'home', 'other']),
    body('context.timeOfDay').optional().isIn(['morning', 'afternoon', 'evening', 'night']),
    body('context.stressLevel').optional().isInt({ min: 1, max: 10 }),
    body('prompts.gratitude').optional().isArray(),
    body('prompts.challenges').optional().isArray(),
    body('prompts.goals').optional().isArray(),
    body('prompts.reflections').optional().isArray(),
    body('privacy.shareWithCounselor').optional().isBoolean(),
    body('privacy.anonymousSharing').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        content,
        mood,
        context,
        prompts,
        privacy
      } = req.body;

      const journalEntry = new JournalEntry({
        userId: req.user._id,
        entry: {
          content,
          mood: {
            scale: mood.scale,
            tags: mood.tags || [],
            colors: mood.colors || []
          },
          context: context || {},
          prompts: prompts || {}
        },
        privacy: {
          isPrivate: true,
          shareWithCounselor: privacy?.shareWithCounselor || false,
          anonymousSharing: privacy?.anonymousSharing || false
        }
      });

      await journalEntry.save();

      // Emit real-time update if anonymous sharing is enabled
      if (journalEntry.privacy.anonymousSharing) {
        const io = require('../index').io;
        io.emit('anonymous-journal-update', {
          mood: journalEntry.entry.mood.scale,
          timestamp: journalEntry.createdAt,
          location: journalEntry.entry.context.location
        });
      }

      res.status(201).json({
        message: 'Journal entry created successfully',
        entry: {
          id: journalEntry._id,
          createdAt: journalEntry.createdAt,
          mood: journalEntry.entry.mood,
          context: journalEntry.entry.context
        }
      });
    } catch (error) {
      console.error('Journal creation error:', error);
      res.status(500).json({ message: 'Error creating journal entry' });
    }
  }
);

// GET /api/journal/:id - Get specific journal entry
router.get('/:id', requireConsent, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-analytics -__v');

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ entry });
  } catch (error) {
    console.error('Journal fetch error:', error);
    res.status(500).json({ message: 'Error fetching journal entry' });
  }
});

// PUT /api/journal/:id - Update journal entry
router.put('/:id',
  requireConsent,
  [
    body('content').optional().isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters'),
    body('mood.scale').optional().isInt({ min: 1, max: 10 }).withMessage('Mood scale must be between 1-10'),
    body('privacy.shareWithCounselor').optional().isBoolean(),
    body('privacy.anonymousSharing').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const entry = await JournalEntry.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      // Update entry fields
      if (req.body.content) entry.entry.content = req.body.content;
      if (req.body.mood) entry.entry.mood = { ...entry.entry.mood, ...req.body.mood };
      if (req.body.context) entry.entry.context = { ...entry.entry.context, ...req.body.context };
      if (req.body.prompts) entry.entry.prompts = { ...entry.entry.prompts, ...req.body.prompts };
      if (req.body.privacy) entry.privacy = { ...entry.privacy, ...req.body.privacy };

      // Increment edit count
      if (!entry.analytics) entry.analytics = {};
      entry.analytics.editCount = (entry.analytics.editCount || 0) + 1;

      await entry.save();

      res.json({
        message: 'Journal entry updated successfully',
        entry: {
          id: entry._id,
          updatedAt: entry.updatedAt
        }
      });
    } catch (error) {
      console.error('Journal update error:', error);
      res.status(500).json({ message: 'Error updating journal entry' });
    }
  }
);

// DELETE /api/journal/:id - Delete journal entry
router.delete('/:id', requireConsent, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    await entry.deleteOne();

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Journal deletion error:', error);
    res.status(500).json({ message: 'Error deleting journal entry' });
  }
});

// GET /api/journal/stats/mood - Get mood statistics
router.get('/stats/mood', requireConsent, async (req, res) => {
  try {
    const timeframe = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const stats = await JournalEntry.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgMood: { $avg: '$entry.mood.scale' },
          avgStress: { $avg: '$entry.context.stressLevel' },
          totalEntries: { $sum: 1 },
          moodTrend: {
            $push: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              mood: '$entry.mood.scale',
              stress: '$entry.context.stressLevel'
            }
          }
        }
      }
    ]);

    res.json({
      stats: stats[0] || {
        avgMood: null,
        avgStress: null,
        totalEntries: 0,
        moodTrend: []
      },
      timeframe
    });
  } catch (error) {
    console.error('Mood stats error:', error);
    res.status(500).json({ message: 'Error fetching mood statistics' });
  }
});

module.exports = router;