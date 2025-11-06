# Docker Deployment Guide

This guide explains how to deploy the Invite Rewards bot using Docker and Docker Compose.

## Why Docker?

Docker provides several benefits:
- ✅ **Consistency**: Same environment everywhere (dev, staging, production)
- ✅ **Isolation**: Bot and database run in isolated containers
- ✅ **Easy Updates**: Pull latest code, rebuild, restart
- ✅ **Portability**: Works on any system with Docker installed
- ✅ **Built-in MongoDB**: No need to install MongoDB separately

## Prerequisites

### Install Docker

**Windows/macOS:**
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install and start Docker Desktop
3. Verify: `docker --version` and `docker-compose --version`

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (avoid using sudo)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**Linux (Other distributions):**
See [Docker installation docs](https://docs.docker.com/engine/install/)

## Quick Start

### 1. Prepare Environment

```bash
# Clone the repository
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3

# Create .env file
cp .env.example .env
```

Edit `.env` with your bot token:
```env
PROD_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://mongo:27017/invite-rewards
```

### 2. Configure the Bot

Edit `config.json` and set `"dev": false` for production mode.

### 3. Start the Bot

```bash
# Start all services (bot + MongoDB)
docker-compose up -d

# The -d flag runs containers in detached mode (background)
```

That's it! Your bot is now running.

## Docker Compose Commands

### View Logs

```bash
# Follow logs from all services
docker-compose logs -f

# Follow logs from just the bot
docker-compose logs -f bot

# Follow logs from just MongoDB
docker-compose logs -f mongo

# View last 100 lines
docker-compose logs --tail=100
```

### Check Status

```bash
# List running containers
docker-compose ps

# Show resource usage
docker stats
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart only the bot
docker-compose restart bot

# Restart only MongoDB
docker-compose restart mongo
```

### Stop Services

```bash
# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove containers + volumes (DELETES ALL DATA)
docker-compose down -v
```

### Update the Bot

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# View logs to ensure it started correctly
docker-compose logs -f bot
```

## Understanding docker-compose.yaml

```yaml
version: '3.8'

services:
  bot:                              # Bot service
    build:
      context: .                    # Build from current directory
      dockerfile: Dockerfile        # Using Dockerfile
    container_name: invite-rewards-bot
    restart: unless-stopped         # Auto-restart on failure
    env_file:
      - .env                        # Load environment variables
    environment:
      - MONGODB_URI=mongodb://mongo:27017/invite-rewards
      - NODE_ENV=production
    depends_on:
      mongo:
        condition: service_healthy  # Wait for MongoDB to be ready
    networks:
      - bot-network                 # Custom network
    volumes:
      - ./logs:/app/logs           # Persist logs

  mongo:                            # MongoDB service
    image: mongo:6                  # Official MongoDB 6 image
    container_name: invite-rewards-mongo
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=invite-rewards
    ports:
      - "27017:27017"              # Expose MongoDB port
    volumes:
      - mongo_data:/data/db         # Persist database data
      - mongo_config:/data/configdb # Persist config data
    networks:
      - bot-network
    healthcheck:                    # Check if MongoDB is ready
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

networks:
  bot-network:                      # Isolated network
    driver: bridge

volumes:
  mongo_data:                       # Named volume for data persistence
    driver: local
  mongo_config:
    driver: local
```

## Understanding Dockerfile

```dockerfile
# Multi-stage build for smaller image size

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                          # Clean install
COPY tsconfig.json ./
COPY config.json ./
COPY src ./src
RUN npm run build                   # Compile TypeScript

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production        # Install only production deps
COPY --from=builder /app/dist ./dist
COPY config.json ./
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs                         # Run as non-root user
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "process.exit(0)"
CMD ["node", "dist/src/index.js"]
```

## Advanced Usage

### Access MongoDB Shell

```bash
# Connect to MongoDB from host
docker exec -it invite-rewards-mongo mongosh invite-rewards

# Inside mongosh:
show collections
db.guilds.find()
db.invites.countDocuments()
exit
```

### Backup Database

```bash
# Create backup
docker exec invite-rewards-mongo mongodump --db invite-rewards --out /data/backup

# Copy backup to host
docker cp invite-rewards-mongo:/data/backup ./mongodb-backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./mongodb-backup invite-rewards-mongo:/data/backup

# Restore
docker exec invite-rewards-mongo mongorestore --db invite-rewards /data/backup/invite-rewards
```

### Custom MongoDB Configuration

Create `mongod.conf`:
```yaml
storage:
  dbPath: /data/db
  journal:
    enabled: true
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
net:
  port: 27017
  bindIp: 0.0.0.0
```

Update `docker-compose.yaml`:
```yaml
mongo:
  image: mongo:6
  volumes:
    - ./mongod.conf:/etc/mongod.conf
  command: mongod --config /etc/mongod.conf
```

### Scale the Bot (Sharding)

If using Discord sharding, you can scale horizontally:

```yaml
# docker-compose.yaml
bot:
  deploy:
    replicas: 3  # Run 3 bot instances
  environment:
    - TOTAL_SHARDS=3
```

### Use External MongoDB

To use MongoDB Atlas or external MongoDB:

```yaml
# docker-compose.yaml - Remove mongo service
services:
  bot:
    # ... existing config ...
    environment:
      - MONGODB_URI=${MONGODB_ATLAS_URI}
    # Remove depends_on since no local MongoDB
```

### Environment-Specific Configs

**Development:**
```bash
# docker-compose.dev.yaml
docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
```

**Production:**
```bash
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs bot

# Check if port is in use
sudo lsof -i :27017  # Linux/macOS
netstat -ano | findstr :27017  # Windows

# Remove and recreate
docker-compose down
docker-compose up -d
```

### MongoDB connection errors

```bash
# Check MongoDB is healthy
docker-compose ps

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Out of disk space

```bash
# Remove unused Docker data
docker system prune -a

# Remove unused volumes (WARNING: May delete data)
docker volume prune
```

### Build fails

```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Permission errors

```bash
# Fix ownership of mounted volumes
sudo chown -R $USER:$USER ./logs

# Or run Docker commands with sudo
sudo docker-compose up -d
```

## Production Best Practices

### 1. Use Docker Secrets for Tokens

```yaml
# docker-compose.yaml
services:
  bot:
    secrets:
      - discord_token
    environment:
      - PROD_TOKEN_FILE=/run/secrets/discord_token

secrets:
  discord_token:
    file: ./secrets/discord_token.txt
```

### 2. Set Resource Limits

```yaml
services:
  bot:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

### 3. Configure Logging

```yaml
services:
  bot:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Use Health Checks

```yaml
services:
  bot:
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5. Automatic Restarts

```yaml
services:
  bot:
    restart: unless-stopped  # or 'always'
```

## Monitoring

### View Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats invite-rewards-bot
```

### Export Logs

```bash
# Export to file
docker-compose logs > bot-logs.txt

# Export with timestamps
docker-compose logs -t > bot-logs-$(date +%Y%m%d).txt
```

## Next Steps

- ✅ Set up automated backups
- ✅ Configure monitoring (Prometheus, Grafana)
- ✅ Set up CI/CD for automatic deployments
- ✅ Use Docker Swarm or Kubernetes for orchestration
- ✅ Implement blue-green deployments

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
