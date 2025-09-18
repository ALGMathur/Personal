const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireConsent } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/consent - Update user consent
router.post('/consent',
  [
    body('consentVersion').notEmpty().withMessage('Consent version is required'),
    body('analyticsOptIn').isBoolean().withMessage('Analytics opt-in must be boolean'),
    body('shareAnonymizedData').isBoolean().withMessage('Data sharing opt-in must be boolean'),
    body('dataRetention').isInt({ min: 30, max: 1095 }).withMessage('Data retention must be between 30-1095 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { consentVersion, analyticsOptIn, shareAnonymizedData, dataRetention } = req.body;
      const auth0Id = req.user?.sub;

      if (!auth0Id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Find or create user
      let user = await User.findOne({ auth0Id });
      
      if (!user) {
        user = new User({
          auth0Id,
          email: req.user.email || 'anonymous@privacy.local',
          displayName: req.user.name || 'Anonymous User',
          consentVersion,
          consentDate: new Date(),
          privacySettings: {
            dataRetention,
            analyticsOptIn,
            shareAnonymizedData
          }
        });
      } else {
        user.consentVersion = consentVersion;
        user.consentDate = new Date();
        user.privacySettings.dataRetention = dataRetention;
        user.privacySettings.analyticsOptIn = analyticsOptIn;
        user.privacySettings.shareAnonymizedData = shareAnonymizedData;
      }

      await user.save();

      res.json({
        message: 'Consent updated successfully',
        user: {
          id: user._id,
          consentVersion: user.consentVersion,
          consentDate: user.consentDate,
          privacySettings: user.privacySettings
        }
      });
    } catch (error) {
      console.error('Consent update error:', error);
      res.status(500).json({ message: 'Error updating consent' });
    }
  }
);

// GET /api/auth/profile - Get user profile
router.get('/profile', requireConsent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-email -auth0Id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        displayName: user.displayName,
        preferences: user.preferences,
        privacySettings: user.privacySettings,
        consentVersion: user.consentVersion,
        consentDate: user.consentDate,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile',
  requireConsent,
  [
    body('displayName').optional().isLength({ max: 50 }).withMessage('Display name must be less than 50 characters'),
    body('preferences.colorTheme').optional().isIn(['calming', 'energizing', 'balanced', 'custom']),
    body('preferences.reminderFrequency').optional().isIn(['daily', 'weekly', 'custom', 'none']),
    body('preferences.journalPrompts').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { displayName, preferences } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (displayName) user.displayName = displayName;
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          displayName: user.displayName,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }
);

// DELETE /api/auth/account - Delete user account (GDPR compliance)
router.delete('/account', requireConsent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Anonymize user data instead of hard delete
    await user.anonymizeData();

    res.json({ 
      message: 'Account successfully anonymized and scheduled for deletion' 
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error processing account deletion' });
  }
});

// POST /api/auth/data-export - Export user data (GDPR compliance)
router.post('/data-export', requireConsent, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const JournalEntry = require('../models/JournalEntry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's journal entries
    const journalEntries = await JournalEntry.find({ 
      userId: user._id 
    }).select('-analytics -__v');

    const exportData = {
      profile: {
        displayName: user.displayName,
        preferences: user.preferences,
        privacySettings: user.privacySettings,
        consentVersion: user.consentVersion,
        consentDate: user.consentDate,
        accountCreated: user.createdAt
      },
      journalEntries: journalEntries,
      exportDate: new Date(),
      exportVersion: '1.0'
    };

    res.json({
      message: 'Data export generated',
      data: exportData
    });
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Error generating data export' });
  }
});

module.exports = router;