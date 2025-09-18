// MongoDB initialization script for Campus Mental Health Platform
db = db.getSiblingDB('campus-mental-health');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('journalentries');

// Create indexes for performance and privacy
db.users.createIndex({ "auth0Id": 1 }, { unique: true });
db.users.createIndex({ "lastActive": 1 });
db.users.createIndex({ "accountStatus": 1 });

db.journalentries.createIndex({ "userId": 1, "createdAt": -1 });
db.journalentries.createIndex({ "privacy.isPrivate": 1 });
db.journalentries.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Create a default admin user (optional)
// db.users.insertOne({
//   auth0Id: "admin|default",
//   email: "admin@campus.edu",
//   displayName: "Campus Admin",
//   consentVersion: "1.0",
//   consentDate: new Date(),
//   privacySettings: {
//     dataRetention: 365,
//     analyticsOptIn: true,
//     shareAnonymizedData: false
//   },
//   accountStatus: "active",
//   createdAt: new Date(),
//   updatedAt: new Date()
// });

print('Campus Mental Health Platform database initialized successfully!');