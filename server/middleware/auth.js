const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const User = require('../models/User');

// Auth0 JWT verification middleware
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Enhanced auth middleware that creates/updates user
const auth = async (req, res, next) => {
  try {
    // First run JWT verification
    jwtCheck(req, res, async (err) => {
      if (err) {
        return res.status(401).json({ 
          message: 'Unauthorized', 
          error: err.message 
        });
      }

      try {
        const auth0Id = req.user.sub;
        
        // Find or create user
        let user = await User.findOne({ auth0Id });
        
        if (!user) {
          // Create new user with privacy-conscious defaults
          user = new User({
            auth0Id,
            email: req.user.email || 'anonymous@privacy.local',
            displayName: req.user.name || 'Anonymous User',
            consentVersion: '1.0',
            consentDate: new Date(),
            privacySettings: {
              dataRetention: 365,
              analyticsOptIn: false,
              shareAnonymizedData: false
            }
          });
          await user.save();
        } else {
          // Update last active timestamp
          await user.updateLastActive();
        }

        // Attach user to request
        req.user = user;
        next();
      } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
          message: 'Authentication processing error' 
        });
      }
    });
  } catch (error) {
    console.error('Auth setup error:', error);
    return res.status(500).json({ 
      message: 'Authentication setup error' 
    });
  }
};

// Optional auth middleware for public endpoints
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  return auth(req, res, next);
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }
  next();
};

// Privacy consent check middleware
const requireConsent = (req, res, next) => {
  if (!req.user || !req.user.consentDate) {
    return res.status(403).json({ 
      message: 'Privacy consent required',
      requiresConsent: true
    });
  }
  
  // Check if consent is still valid (e.g., within last year)
  const consentAge = Date.now() - req.user.consentDate.getTime();
  const maxConsentAge = 365 * 24 * 60 * 60 * 1000; // 1 year
  
  if (consentAge > maxConsentAge) {
    return res.status(403).json({ 
      message: 'Privacy consent expired',
      requiresConsent: true
    });
  }
  
  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  requireConsent
};