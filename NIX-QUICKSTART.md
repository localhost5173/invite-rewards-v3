# Quick Start with Nix

This guide is for users who want to use Nix for a reproducible development environment.

## Why Nix?

Using Nix ensures:
- ✅ Consistent development environment across all machines
- ✅ No need to manually install Node.js, npm, Docker, etc.
- ✅ Automatic dependency management
- ✅ Works on Linux, macOS, and WSL2

## Prerequisites

Just Nix! If you don't have it:

```bash
# Install Nix (Linux/macOS/WSL2)
sh <(curl -L https://nixos.org/nix/install) --daemon

# Enable flakes
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

## Setup (5 minutes)

### 1. Clone and Enter Environment

```bash
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3

# Enter Nix development shell (downloads all dependencies automatically)
nix develop
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Configure Bot

```bash
# Create environment file
cp .env.example .env

# Edit with your bot token (get from Discord Developer Portal)
nano .env
```

Add your bot token:
```env
DEV_TOKEN=your_discord_bot_token_here
PROD_TOKEN=your_discord_bot_token_here
MONGODB_URI=mongodb://localhost:27017/invite-rewards
```

### 4. Start MongoDB

**Option A: Using Docker (included in Nix shell):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

**Option B: Use the full Docker Compose setup:**
```bash
docker-compose up -d
# This starts both MongoDB and the bot
```

### 5. Run the Bot

```bash
# Development mode (auto-reload on file changes)
npm run dev
```

You should see:
```
Running in development mode.
Connected to MongoDB
MongoDB connection verified
Bot logged in as YourBotName#1234
```

## Common Commands

All these commands work inside the `nix develop` shell:

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
node dist/src/index.js

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Docker operations
docker-compose up -d
docker-compose logs -f bot
docker-compose down
```

## Outside the Nix Shell

You can also run commands without entering the shell:

```bash
# Run dev mode
nix develop --command npm run dev

# Build
nix develop --command npm run build

# Docker compose
nix develop --command docker-compose up -d
```

## What's Included in the Nix Environment?

When you run `nix develop`, you get:
- Node.js 20
- npm
- TypeScript
- Docker
- docker-compose
- jq (for JSON manipulation)

All versions are pinned for reproducibility!

## Troubleshooting

### "experimental-features" error

Enable flakes:
```bash
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

### Slow first run

The first `nix develop` downloads all dependencies. Subsequent runs are instant.

### MongoDB connection refused

Start MongoDB first:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6
```

Or use the full Docker Compose stack:
```bash
docker-compose up -d
```

## Next Steps

- 📖 Read the full [SETUP.md](SETUP.md) for detailed configuration
- 📚 Check [README.md](README.md) for all features
- 🎮 Test commands in your Discord server
- 🚀 Deploy with Docker when ready

## Why This Is Better Than Manual Setup

| Manual Setup | With Nix |
|-------------|----------|
| Install Node.js manually | ✅ Automatic |
| Install Docker manually | ✅ Automatic |
| Version conflicts | ✅ Never happens |
| "Works on my machine" | ✅ Works everywhere |
| Setup time: ~30 min | ⚡ Setup time: ~5 min |

Happy coding! 🎉
