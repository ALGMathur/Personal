# Campus Mental Health Platform

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)
```bash
# Clone and navigate to project
git clone https://github.com/ALGMathur/Personal.git
cd Personal

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Update environment variables with your Auth0 credentials
# Edit server/.env and client/.env.local

# Start with Docker
docker-compose up -d

# Check status
docker-compose ps
```

### Option 2: Local Development
```bash
# Install dependencies
npm install
npm run install-all

# Set up environment
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Start development servers
npm run dev
```

### Option 3: Manual Deployment
```bash
# Run deployment script
./deploy.sh

# Start production server
./start.sh
```

## 🔧 Environment Configuration

### Server (.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-mental-health
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
```

### Client (.env.local)
```bash
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-api-identifier
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🏥 Health Checks

- **Server Health**: `GET /api/health`
- **Frontend**: `http://localhost:3000`
- **API Base**: `http://localhost:5000/api`

## 📊 Features Implemented

✅ **Core Platform**
- MERN stack architecture
- Auth0 secure authentication
- Mobile-first responsive design
- Privacy-conscious data storage

✅ **User Experience**
- Color psychology themes
- Progressive Web App support
- Real-time socket communication
- Consent management

✅ **Developer Experience**
- Docker containerization
- Automated deployment
- Health monitoring
- Comprehensive documentation

## 🔒 Security Features

- JWT token authentication
- Data encryption at rest
- GDPR-compliant privacy controls
- Rate limiting and CORS protection
- Helmet.js security headers

## 📱 Mobile Support

- Touch-friendly interfaces
- Responsive breakpoints
- PWA installation
- Offline capability (future)

## 🎨 Color Psychology Themes

- **Calming**: Soft blues and greens for relaxation
- **Energizing**: Warm oranges and yellows for motivation
- **Balanced**: Purple and teal for harmony

## 🚢 Production Deployment

1. Set up MongoDB Atlas or local MongoDB
2. Configure Auth0 application and API
3. Update environment variables
4. Deploy using Docker or cloud platform
5. Configure SSL/HTTPS
6. Set up monitoring and backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

- 🐛 **Issues**: GitHub Issues
- 📖 **Docs**: See README sections
- 🏥 **Crisis**: Contact local emergency services

---

Built with ❤️ for campus mental health support