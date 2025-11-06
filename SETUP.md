# Detailed Setup Guide

This guide will walk you through setting up the Invite Rewards bot from scratch.

## Prerequisites Installation

### Option A: Using Nix (Recommended - All Platforms)

This project includes a Nix flake that provides all required dependencies automatically.

**Install Nix:**
```bash
# Linux/macOS
sh <(curl -L https://nixos.org/nix/install) --daemon

# Enable flakes
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

**Enter Development Environment:**
```bash
# All commands in this guide should be run with:
nix develop --command <command>

# Or enter the shell once:
nix develop

# Now you have Node.js 20, npm, TypeScript, Docker, and docker-compose available
```

### Option B: Manual Installation

### 1. Install Node.js

**Windows:**
- Download from [nodejs.org](https://nodejs.org/) (v20 LTS or higher)
- Run the installer
- Verify: `node --version` and `npm --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node@20
```

### 2. Install MongoDB

**Option A: Local Installation**

**Windows:**
- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Run the installer
- Start MongoDB service

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Option B: Use Docker (Easiest)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6yy
```

**Option C: MongoDB Atlas (Cloud)**
1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Use in `MONGODB_URI` environment variable

### 3. Install Docker (Optional, for Docker deployment)

**Windows/macOS:**
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Discord Bot Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Invite Rewards")
4. Click "Create"

### 2. Create a Bot User

1. In your application, click "Bot" in the left sidebar
2. Click "Add Bot"
3. Confirm by clicking "Yes, do it!"
4. **Copy your bot token** (you'll need this for `.env`)
5. Enable these Privileged Gateway Intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 3. Get Your Bot's Client ID

1. Click "General Information" in the left sidebar
2. Copy your "Application ID" (this is your bot's Client ID)

### 4. Generate Invite Link

Use this template, replacing `YOUR_CLIENT_ID` with your actual client ID:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=395405454448&scope=bot
```

Example:
```
https://discord.com/oauth2/authorize?client_id=1234567890123456789&permissions=395405454448&scope=bot
```

## Project Setup

### 1. Clone and Install

**With Nix (Recommended):**
```bash
# Clone the repository
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3

# Enter Nix development environment
nix develop

# Install dependencies
npm install
```

**Without Nix:**
```bash
# Clone the repository
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit with your favorite editor
nano .env  # or vim, code, notepad, etc.
```

Minimal `.env` configuration:
```env
# Use DEV_TOKEN for testing
DEV_TOKEN=YOUR_BOT_TOKEN_HERE
PROD_TOKEN=YOUR_BOT_TOKEN_HERE

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/invite-rewards

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invite-rewards
```

### 3. Configure Bot Settings

Edit `config.json`:

```json
{
  "dev": true,  // Set to true for testing, false for production
  "bot": {
    "logo": "https://cdn.discordapp.com/avatars/YOUR_BOT_ID/YOUR_AVATAR_HASH.png",
    "server": "https://discord.gg/your-support-server",
    "website": "https://your-website.com",
    "guide": "https://your-guide.com",
    "vote": "https://top.gg/bot/YOUR_BOT_ID/vote",
    "topgg": "https://top.gg/bot/YOUR_BOT_ID",
    "topBotId": "YOUR_BOT_ID",
    "inviteLink": "https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=395405454448&scope=bot"
  }
}
```

For testing, you can leave the URLs as-is or use placeholders.

### 4. First Run

**With Nix:**
```bash
# Enter development environment (if not already in it)
nix develop

# Development mode (with auto-reload)
npm run dev
```

**Or run directly:**
```bash
nix develop --command npm run dev
```

**Without Nix:**
```bash
# Development mode (with auto-reload)
npm run dev
```

You should see:
```
Running in development mode.
Connected to MongoDB
MongoDB connection verified
Bot logged in as YourBotName#1234
```

## Testing

### 1. Invite Your Bot

1. Use the invite link you created earlier
2. Select a test server (create one if needed)
3. Authorize the bot with all requested permissions

### 2. Test Basic Commands

In your Discord server:
```
/help          # View available commands
/invite        # Check your invite count
/rewards view  # View configured rewards
```

### 3. Test Invite Tracking

1. Create an invite link in your server
2. Use it to join with another account (or ask a friend)
3. Check if the invite was tracked: `/invited-list`

## Production Deployment

### Method 1: Direct Deployment

**With Nix:**
```bash
# Set production mode
# Edit config.json and set "dev": false

# Build the project
nix develop --command npm run build

# Run with a process manager (PM2)
nix develop --command npm install -g pm2
nix develop --command pm2 start dist/src/index.js --name invite-rewards
nix develop --command pm2 save
nix develop --command pm2 startup  # Follow the instructions to enable auto-start
```

**Without Nix:**
```bash
# Set production mode
# Edit config.json and set "dev": false

# Build the project
npm run build

# Run with a process manager (PM2)
npm install -g pm2
pm2 start dist/src/index.js --name invite-rewards
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### Method 2: Docker Deployment

**With Nix:**
```bash
# Make sure .env is configured
# Set "dev": false in config.json

# Start with Docker Compose
nix develop --command docker-compose up -d

# View logs
nix develop --command docker-compose logs -f bot

# Stop
nix develop --command docker-compose down
```

**Without Nix:**
```bash
# Make sure .env is configured
# Set "dev": false in config.json

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop
docker-compose down
```

### Method 3: VPS Deployment

**On your VPS:**

```bash
# Install Node.js and MongoDB (see above)

# Clone the repository
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Add your tokens and MongoDB URI

# Build
npm run build

# Install PM2
npm install -g pm2

# Start the bot
pm2 start dist/src/index.js --name invite-rewards-bot
pm2 save
pm2 startup  # Follow instructions
```

## Optional: Top.gg Integration

If you want to publish your bot on Top.gg:

1. Submit your bot to [top.gg](https://top.gg/)
2. Get your Top.gg API token
3. Add to `.env`:
   ```env
   TOPGG_TOKEN=your_topgg_token_here
   ```
4. Set `"dev": false` in `config.json` to enable autoposter

## Troubleshooting

### "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection failed

```bash
# Check MongoDB is running
mongosh  # Should connect without errors

# Or for Docker:
docker ps  # Should show MongoDB container running
```

### Bot not responding to commands

1. Check bot is online in Discord
2. Ensure bot has proper permissions in your server
3. Wait up to 1 hour for global commands to register
4. Try kicking and re-inviting the bot

### TypeScript compilation errors

```bash
# Clean build
rm -rf dist
npm run build
```

## Next Steps

1. ✅ Customize welcome messages: `/welcome` and `/farewell`
2. ✅ Set up rewards: `/rewards add`
3. ✅ Configure auto-roles: `/auto-roles add`
4. ✅ Create giveaways: `/giveaway create`
5. ✅ Set up verification: `/verification setup`
6. ✅ Configure language: `/language set`

## Need Help?

- Join the [Support Server](https://discord.com/invite/7Q9nheNq2M)
- Check the main [README.md](README.md)
- Review the code in `src/commands/` for command examples
