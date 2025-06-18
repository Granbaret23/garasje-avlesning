# Multi-stage build for optimized production image

# Stage 1: Frontend (skip build if pre-built)
FROM node:16-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy everything including pre-built files if they exist
COPY frontend/ ./

# Only build if build directory doesn't exist
RUN if [ ! -d "build" ]; then \
      npm ci --legacy-peer-deps && \
      npm run build; \
    else \
      echo "Using pre-built frontend"; \
    fi

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy ALL backend files
COPY backend ./

# Install dependencies (including tsx for running TypeScript)
RUN npm ci || npm install

# Stage 3: Production image
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy entire backend (no build, just source)
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --only=production || npm install --only=production && npm cache clean --force

# Create directories for data, uploads, and logs
RUN mkdir -p /app/data /app/uploads /app/logs

# Set proper permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3001

# Start application with tsx
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "tsx", "src/index.ts"]