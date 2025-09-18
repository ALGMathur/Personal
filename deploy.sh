#!/bin/bash

# Campus Mental Health Platform Deployment Script

set -e

echo "🏥 Deploying Campus Mental Health Platform..."

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm run install-all

# Run tests if they exist
echo "🧪 Running tests..."
if [ -f "server/package.json" ] && npm list --depth=0 -s jest 2>/dev/null; then
    echo "Running server tests..."
    cd server && npm test && cd ..
fi

if [ -f "client/package.json" ] && npm list --depth=0 -s @testing-library/react 2>/dev/null; then
    echo "Running client tests..."
    cd client && npm test -- --coverage --watchAll=false && cd ..
fi

# Build the client
echo "🔨 Building client..."
cd client
npm run build
cd ..

# Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f "server/.env" ]; then
    echo "⚠️  Warning: server/.env file not found. Copying from example..."
    cp server/.env.example server/.env
    echo "Please update server/.env with your configuration."
fi

if [ ! -f "client/.env.local" ]; then
    echo "⚠️  Warning: client/.env.local file not found. Copying from example..."
    cp client/.env.example client/.env.local
    echo "Please update client/.env.local with your Auth0 configuration."
fi

# Create production start script
echo "📝 Creating production start script..."
cat > start.sh << 'EOF'
#!/bin/bash
# Production start script for Campus Mental Health Platform

echo "Starting Campus Mental Health Platform..."

# Set production environment
export NODE_ENV=production

# Start the server
echo "Starting server on port ${PORT:-5000}..."
cd server && npm start
EOF

chmod +x start.sh

echo "✅ Deployment preparation complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update server/.env with your MongoDB URI and Auth0 configuration"
echo "2. Update client/.env.local with your Auth0 client configuration"
echo "3. For local development: npm run dev"
echo "4. For production: ./start.sh"
echo ""
echo "📚 Documentation: See README.md for detailed setup instructions"
echo "🔒 Security: Remember to configure HTTPS in production"
echo "🏥 Health check: GET /api/health"