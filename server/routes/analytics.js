const express = require('express');
const { query, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { requireConsent } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/dashboard - Get user's personal analytics dashboard
router.get('/dashboard',
  requireConsent,
  [
    query('timeframe').optional().isInt({ min: 7, max: 365 }).withMessage('Timeframe must be between 7-365 days')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if user has opted into analytics
      if (!req.user.privacySettings.analyticsOptIn) {
        return res.status(403).json({ 
          message: 'Analytics not enabled. Please opt-in through privacy settings.' 
        });
      }

      const timeframe = parseInt(req.query.timeframe) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      // Personal analytics aggregation
      const analytics = await JournalEntry.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            avgMood: { $avg: '$entry.mood.scale' },
            avgStress: { $avg: '$entry.context.stressLevel' },
            avgReadTime: { $avg: '$analytics.readTime' },
            mostCommonMoodTags: { $push: '$entry.mood.tags' },
            locationPatterns: { $push: '$entry.context.location' },
            timeOfDayPatterns: { $push: '$entry.context.timeOfDay' },
            moodTrend: {
              $push: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                mood: '$entry.mood.scale',
                stress: '$entry.context.stressLevel'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalEntries: 1,
            avgMood: { $round: ['$avgMood', 2] },
            avgStress: { $round: ['$avgStress', 2] },
            avgReadTime: { $round: ['$avgReadTime', 0] },
            mostCommonMoodTags: 1,
            locationPatterns: 1,
            timeOfDayPatterns: 1,
            moodTrend: 1
          }
        }
      ]);

      // Process mood tags frequency
      const moodTagsFlat = analytics[0]?.mostCommonMoodTags?.flat() || [];
      const moodTagFrequency = moodTagsFlat.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      // Process location patterns
      const locationFrequency = (analytics[0]?.locationPatterns || []).reduce((acc, location) => {
        if (location) acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {});

      // Process time patterns
      const timePatterns = (analytics[0]?.timeOfDayPatterns || []).reduce((acc, time) => {
        if (time) acc[time] = (acc[time] || 0) + 1;
        return acc;
      }, {});

      const result = {
        timeframe,
        summary: analytics[0] || {
          totalEntries: 0,
          avgMood: null,
          avgStress: null,
          avgReadTime: null
        },
        insights: {
          moodTagFrequency,
          locationFrequency,
          timePatterns,
          moodTrend: analytics[0]?.moodTrend || []
        },
        recommendations: generateRecommendations(analytics[0])
      };

      res.json(result);
    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({ message: 'Error generating analytics dashboard' });
    }
  }
);

// GET /api/analytics/anonymous - Get anonymized campus-wide statistics
router.get('/anonymous', async (req, res) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 30;
    
    // Get anonymized statistics from entries that opted into sharing
    const stats = await JournalEntry.getAnonymizedStats(timeframe);

    if (!stats || stats.length === 0) {
      return res.json({
        message: 'No anonymized data available',
        stats: null,
        timeframe
      });
    }

    res.json({
      campusStats: stats[0],
      timeframe,
      disclaimer: 'This data is anonymized and aggregated from users who opted into data sharing.'
    });
  } catch (error) {
    console.error('Anonymous analytics error:', error);
    res.status(500).json({ message: 'Error fetching anonymous statistics' });
  }
});

// GET /api/analytics/mood-colors - Get mood color analytics
router.get('/mood-colors',
  requireConsent,
  async (req, res) => {
    try {
      if (!req.user.privacySettings.analyticsOptIn) {
        return res.status(403).json({ 
          message: 'Analytics not enabled' 
        });
      }

      const timeframe = parseInt(req.query.timeframe) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframe);

      const colorAnalytics = await JournalEntry.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: { $gte: startDate },
            'entry.mood.colors': { $exists: true, $ne: [] }
          }
        },
        {
          $unwind: '$entry.mood.colors'
        },
        {
          $group: {
            _id: '$entry.mood.colors.color',
            frequency: { $sum: 1 },
            avgIntensity: { $avg: '$entry.mood.colors.intensity' },
            avgMoodWhenUsed: { $avg: '$entry.mood.scale' }
          }
        },
        {
          $sort: { frequency: -1 }
        },
        {
          $project: {
            color: '$_id',
            frequency: 1,
            avgIntensity: { $round: ['$avgIntensity', 2] },
            avgMoodWhenUsed: { $round: ['$avgMoodWhenUsed', 2] },
            _id: 0
          }
        }
      ]);

      res.json({
        colorAnalytics,
        timeframe,
        insights: generateColorInsights(colorAnalytics)
      });
    } catch (error) {
      console.error('Color analytics error:', error);
      res.status(500).json({ message: 'Error fetching color analytics' });
    }
  }
);

// GET /api/analytics/export - Export analytics data (GDPR compliance)
router.get('/export', requireConsent, async (req, res) => {
  try {
    if (!req.user.privacySettings.analyticsOptIn) {
      return res.status(403).json({ 
        message: 'Analytics not enabled' 
      });
    }

    const timeframe = parseInt(req.query.timeframe) || 365; // Full year by default
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Get comprehensive analytics data
    const analyticsData = await JournalEntry.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).select('entry.mood entry.context analytics createdAt').lean();

    const exportData = {
      user: {
        id: req.user._id,
        analyticsOptIn: req.user.privacySettings.analyticsOptIn,
        dataRetention: req.user.privacySettings.dataRetention
      },
      timeframe,
      entries: analyticsData.map(entry => ({
        date: entry.createdAt,
        mood: entry.entry.mood,
        context: entry.entry.context,
        analytics: entry.analytics
      })),
      exportTimestamp: new Date(),
      format: 'JSON',
      version: '1.0'
    };

    res.json({
      message: 'Analytics data export generated',
      data: exportData
    });
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ message: 'Error exporting analytics data' });
  }
});

// Helper function to generate personalized recommendations
function generateRecommendations(analytics) {
  const recommendations = [];

  if (!analytics) return recommendations;

  // Mood-based recommendations
  if (analytics.avgMood < 5) {
    recommendations.push({
      type: 'mood',
      priority: 'high',
      message: 'Your recent mood scores suggest you might benefit from additional support. Consider reaching out to campus counseling services.',
      action: 'contact_counselor'
    });
  } else if (analytics.avgMood > 7) {
    recommendations.push({
      type: 'mood',
      priority: 'low',
      message: 'Great job maintaining positive mood levels! Keep up the healthy habits.',
      action: 'maintain_habits'
    });
  }

  // Stress-based recommendations
  if (analytics.avgStress > 7) {
    recommendations.push({
      type: 'stress',
      priority: 'high',
      message: 'Your stress levels have been elevated. Consider stress management techniques like deep breathing or meditation.',
      action: 'stress_management'
    });
  }

  // Journaling frequency recommendations
  if (analytics.totalEntries < 7) {
    recommendations.push({
      type: 'engagement',
      priority: 'medium',
      message: 'Regular journaling can help improve mental clarity. Try setting a daily reminder.',
      action: 'increase_frequency'
    });
  }

  return recommendations;
}

// Helper function to generate color psychology insights
function generateColorInsights(colorAnalytics) {
  const insights = [];

  colorAnalytics.forEach(color => {
    if (color.frequency >= 3) { // Only provide insights for frequently used colors
      switch (color.color.toLowerCase()) {
        case 'blue':
          insights.push(`Blue appears frequently in your entries (${color.frequency} times), often associated with calm and stability.`);
          break;
        case 'red':
          insights.push(`Red usage (${color.frequency} times) may indicate high energy or stress periods.`);
          break;
        case 'green':
          insights.push(`Green in your entries (${color.frequency} times) often represents growth and balance.`);
          break;
        case 'yellow':
          insights.push(`Yellow usage (${color.frequency} times) may reflect optimism and energy.`);
          break;
        default:
          if (color.avgMoodWhenUsed > 7) {
            insights.push(`${color.color} seems to be associated with your positive moods.`);
          }
      }
    }
  });

  return insights;
}

module.exports = router;