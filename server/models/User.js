const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Privacy-conscious user schema with minimal data collection
const userSchema = new mongoose.Schema({
  // Auth0 integration
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // Hash email for privacy
    set: function(email) {
      return bcrypt.hashSync(email, 10);
    }
  },
  // Minimal profile data
  displayName: {
    type: String,
    maxlength: 50,
    default: 'Anonymous User'
  },
  // Privacy settings
  privacySettings: {
    dataRetention: {
      type: Number,
      default: 365, // days
      min: 30,
      max: 1095 // 3 years max
    },
    analyticsOptIn: {
      type: Boolean,
      default: false
    },
    shareAnonymizedData: {
      type: Boolean,
      default: false
    }
  },
  // Mental health preferences
  preferences: {
    colorTheme: {
      type: String,
      enum: ['calming', 'energizing', 'balanced', 'custom'],
      default: 'calming'
    },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom', 'none'],
      default: 'daily'
    },
    journalPrompts: {
      type: Boolean,
      default: true
    }
  },
  // Compliance and consent
  consentVersion: {
    type: String,
    required: true
  },
  consentDate: {
    type: Date,
    required: true
  },
  // Audit trail (privacy-conscious)
  lastActive: {
    type: Date,
    default: Date.now
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  // Automatic data expiration based on privacy settings
  expires: function() {
    return this.privacySettings.dataRetention * 24 * 60 * 60;
  }
});

// Indexes for performance and privacy
userSchema.index({ auth0Id: 1 });
userSchema.index({ lastActive: 1 });
userSchema.index({ accountStatus: 1 });

// Methods
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.anonymizeData = function() {
  this.email = 'anonymized@privacy.local';
  this.displayName = 'Anonymous User';
  this.accountStatus = 'deleted';
  return this.save();
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  return this.find({ accountStatus: 'active' });
};

module.exports = mongoose.model('User', userSchema);