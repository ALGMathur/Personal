const mongoose = require('mongoose');

// Privacy-conscious journal schema with encryption support
const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Structured journaling fields
  entry: {
    // Main content (should be encrypted in production)
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    // Mood tracking with color psychology
    mood: {
      scale: {
        type: Number,
        min: 1,
        max: 10,
        required: true
      },
      colors: [{
        color: String,
        intensity: {
          type: Number,
          min: 1,
          max: 5
        }
      }],
      tags: [{
        type: String,
        enum: [
          'anxious', 'calm', 'stressed', 'happy', 'sad', 'angry', 
          'motivated', 'tired', 'focused', 'overwhelmed', 'peaceful', 'excited'
        ]
      }]
    },
    // Structured prompts
    prompts: {
      gratitude: [String],
      challenges: [String],
      goals: [String],
      reflections: [String]
    },
    // Context (anonymous)
    context: {
      location: {
        type: String,
        enum: ['campus', 'dorm', 'library', 'outdoors', 'home', 'other']
      },
      timeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      },
      stressLevel: {
        type: Number,
        min: 1,
        max: 10
      }
    }
  },
  // Privacy and sharing settings
  privacy: {
    isPrivate: {
      type: Boolean,
      default: true
    },
    shareWithCounselor: {
      type: Boolean,
      default: false
    },
    anonymousSharing: {
      type: Boolean,
      default: false
    }
  },
  // Analytics data (anonymized)
  analytics: {
    readTime: Number, // seconds
    editCount: {
      type: Number,
      default: 0
    },
    sentiment: {
      score: Number, // -1 to 1
      confidence: Number
    }
  },
  // Automatic expiration based on user privacy settings
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for privacy and performance
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ 'privacy.isPrivate': 1 });
journalEntrySchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiration
journalEntrySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      if (user && user.privacySettings.dataRetention) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + user.privacySettings.dataRetention);
        this.expiresAt = expirationDate;
      }
    } catch (error) {
      console.error('Error setting expiration:', error);
    }
  }
  next();
});

// Methods for privacy
journalEntrySchema.methods.anonymize = function() {
  this.entry.content = '[Content removed for privacy]';
  this.privacy.isPrivate = true;
  this.privacy.shareWithCounselor = false;
  return this.save();
};

// Static methods for analytics (privacy-conscious)
journalEntrySchema.statics.getAnonymizedStats = function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        'privacy.anonymousSharing': true
      }
    },
    {
      $group: {
        _id: null,
        avgMood: { $avg: '$entry.mood.scale' },
        avgStress: { $avg: '$entry.context.stressLevel' },
        totalEntries: { $sum: 1 },
        moodTrends: {
          $push: {
            date: '$createdAt',
            mood: '$entry.mood.scale',
            stress: '$entry.context.stressLevel'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        avgMood: { $round: ['$avgMood', 2] },
        avgStress: { $round: ['$avgStress', 2] },
        totalEntries: 1,
        moodTrends: 1
      }
    }
  ]);
};

module.exports = mongoose.model('JournalEntry', journalEntrySchema);