# Campus Mental Health Platform

A mobile-first MERN stack platform for campus mental health interventions. Features include Auth0-based secure login, responsive React UI with color psychology, Node.js backend with privacy-conscious MongoDB schemas, REST and socket-based communication, structured journaling modules, and analytics-ready data capture. Designed for scalability, compliance, and real-time engagement.

## 🌟 Features

### 🔐 Security & Privacy
- **Auth0 Integration**: Secure authentication with industry-standard protocols
- **Privacy-First Design**: GDPR compliant with user-controlled data retention
- **Encrypted Data Storage**: All sensitive data is encrypted at rest
- **Minimal Data Collection**: Only essential information is collected

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for mobile, tablet, and desktop
- **Progressive Web App**: Can be installed as an app on mobile devices
- **Touch-Friendly**: Large touch targets and mobile-optimized interactions

### 🎨 Color Psychology
- **Therapeutic Themes**: Calming, energizing, and balanced color schemes
- **Mood-Based Colors**: Color selection tools for emotional expression
- **Accessibility**: High contrast and colorblind-friendly options

### 📊 Mental Health Features
- **Structured Journaling**: Guided prompts and mood tracking
- **Analytics Dashboard**: Personal insights and trend analysis
- **Anonymous Campus Stats**: Aggregated mental health data for the community
- **Real-time Support**: Socket-based communication for immediate help

### 🛠 Technical Stack
- **Frontend**: React 18, Material-UI, Socket.io Client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Authentication**: Auth0
- **Privacy**: Data encryption, automatic expiration, user consent management

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Auth0 account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ALGMathur/Personal.git
   cd Personal
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install-all
   ```

3. **Environment Setup**
   
   **Server (.env)**:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```
   
   **Client (.env.local)**:
   ```bash
   cp client/.env.example client/.env.local
   # Edit client/.env.local with your Auth0 settings
   ```

4. **Configure Auth0**
   - Create an Auth0 application
   - Set up API (identifier: your-api-identifier)
   - Configure allowed callback URLs: `http://localhost:3000`
   - Add your Auth0 credentials to environment files

5. **Start the application**
   ```bash
   # Development mode (starts both client and server)
   npm run dev
   
   # Or start individually
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/consent` - Update user consent and privacy settings
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account (GDPR)
- `POST /api/auth/data-export` - Export user data (GDPR)

### Journal Endpoints
- `GET /api/journal` - Get user's journal entries
- `POST /api/journal` - Create new journal entry
- `GET /api/journal/:id` - Get specific journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry
- `GET /api/journal/stats/mood` - Get mood statistics

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Personal analytics dashboard
- `GET /api/analytics/anonymous` - Anonymous campus statistics
- `GET /api/analytics/mood-colors` - Color psychology analytics
- `GET /api/analytics/export` - Export analytics data

### User Management
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences
- `PUT /api/user/privacy` - Update privacy settings

## 🔧 Development

### Code Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and theme files
│   └── public/             # Static assets
│
├── server/                 # Node.js backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth and validation
│   ├── controllers/        # Business logic
│   └── utils/              # Helper functions
│
└── package.json            # Root package configuration
```

### Testing
```bash
# Run all tests
npm test

# Server tests only
cd server && npm test

# Client tests only
cd client && npm test
```

### Building for Production
```bash
# Build client
npm run build

# Start production server
npm start
```

## 🛡 Privacy & Security

### Data Protection
- All personal data is encrypted using AES-256
- Passwords are hashed with bcrypt
- API endpoints are protected with JWT tokens
- Rate limiting prevents abuse

### Privacy Controls
- Users control data retention periods (30 days - 3 years)
- Optional analytics with explicit consent
- Anonymous data sharing for campus insights
- GDPR-compliant data export and deletion

### Compliance Features
- Consent management with versioning
- Audit trails for data access
- Automatic data expiration
- Privacy-by-design architecture

## 🌐 Deployment

### Environment Variables
See `.env.example` files for required environment variables.

### Database Setup
The application uses MongoDB with privacy-conscious schemas:
- Automatic data expiration based on user preferences
- Encrypted sensitive fields
- Optimized indexes for performance

### Scaling Considerations
- Stateless API design for horizontal scaling
- Socket.io with Redis adapter for multi-instance support
- MongoDB sharding for large datasets
- CDN integration for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Ensure mobile-first responsive design
- Consider privacy implications of new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact campus mental health services
- Review the documentation and API guides

## 🙏 Acknowledgments

- Mental health professionals who provided guidance
- Auth0 for secure authentication services
- MongoDB for privacy-conscious data storage
- React and Material-UI communities
- Color psychology research contributors

---

**Note**: This platform is designed to supplement, not replace, professional mental health services. Please seek professional help if you're experiencing a mental health crisis.
