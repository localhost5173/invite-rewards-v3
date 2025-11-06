# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy source code and config files
COPY tsconfig.json ./
COPY config.json ./
COPY src ./src

# Build the TypeScript project
RUN npm run build

# Copy language files to dist (like in deploy script)
RUN mkdir -p ./dist/src/languages && \
    cp -r ./src/languages/* ./dist/src/languages/

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder (including language files)
COPY --from=builder /app/dist ./dist
COPY config.json ./

# Copy config.json to dist as well (like deploy script)
RUN cp config.json ./dist/

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "process.exit(0)"

# Start the app
CMD ["node", "dist/src/index.js"]
