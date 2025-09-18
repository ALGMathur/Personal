const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireConsent } = require('../middleware/auth');

const router = express.Router();

// GET /api/user/preferences - Get user preferences
router.get('/preferences', requireConsent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences privacySettings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      preferences: user.preferences,
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({ message: 'Error fetching preferences' });
  }
});

// PUT /api/user/preferences - Update user preferences
router.put('/preferences',
  requireConsent,
  [
    body('colorTheme').optional().isIn(['calming', 'energizing', 'balanced', 'custom']),
    body('reminderFrequency').optional().isIn(['daily', 'weekly', 'custom', 'none']),
    body('journalPrompts').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update preferences
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          user.preferences[key] = req.body[key];
        }
      });

      await user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Preferences update error:', error);
      res.status(500).json({ message: 'Error updating preferences' });
    }
  }
);

// PUT /api/user/privacy - Update privacy settings
router.put('/privacy',
  requireConsent,
  [
    body('dataRetention').optional().isInt({ min: 30, max: 1095 }),
    body('analyticsOptIn').optional().isBoolean(),
    body('shareAnonymizedData').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update privacy settings
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          user.privacySettings[key] = req.body[key];
        }
      });

      await user.save();

      res.json({
        message: 'Privacy settings updated successfully',
        privacySettings: user.privacySettings
      });
    } catch (error) {
      console.error('Privacy update error:', error);
      res.status(500).json({ message: 'Error updating privacy settings' });
    }
  }
);

module.exports = router;