# Multi-stage build for Campus Mental Health Platform

# Stage 1: Build React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Setup server
FROM node:18-alpine AS server
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server source
COPY server/ ./server/

# Copy built client
COPY --from=client-builder /app/client/build ./client/build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S campus -u 1001

# Set permissions
RUN chown -R campus:nodejs /app
USER campus

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start server
WORKDIR /app/server
CMD ["npm", "start"]