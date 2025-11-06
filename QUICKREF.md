# 🚀 Quick Reference Card

## Fastest Setup (Nix Users - 5 Minutes)

```bash
git clone <repo-url> && cd invite-rewards-v3
nix develop
npm install
cp .env.example .env
# Edit .env with your Discord bot token
docker run -d -p 27017:27017 --name mongodb mongo:6
npm run dev
```

## Essential Commands

### Development
```bash
# Start with auto-reload
npm run dev

# With Nix
nix develop --command npm run dev
```

### Production
```bash
# Build
npm run build

# Run
node dist/src/index.js

# With PM2
pm2 start dist/src/index.js --name invite-rewards-bot
```

### Docker
```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop
docker-compose down

# Full reset
docker-compose down -v

# With Nix
nix develop --command docker-compose up -d
```

### MongoDB
```bash
# Start standalone
docker run -d -p 27017:27017 --name mongodb mongo:6

# Connect with shell
mongosh

# Stop
docker stop mongodb
```

## Required Files

### `.env` (create from .env.example)
```env
DEV_TOKEN=your_discord_bot_token_here
PROD_TOKEN=your_discord_bot_token_here
MONGODB_URI=mongodb://localhost:27017/invite-rewards
```

### `config.json` (already exists)
```json
{
  "dev": true,  // Set false for production
  ...
}
```

## Get Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" → "Add Bot"
4. Copy token → Paste in `.env`
5. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

## Invite Bot to Server

```
https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=395405454448&scope=bot
```

Replace `YOUR_BOT_ID` with your Application ID from Discord Developer Portal.

## Test Commands in Discord

```
/help          - Show all commands
/invite        - Check your invites
/rewards view  - See reward tiers
/leaderboard   - Top inviters
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | `rm -rf node_modules && npm install` |
| MongoDB connection failed | Start MongoDB: `docker run -d -p 27017:27017 --name mongodb mongo:6` |
| Bot not responding | Wait 1 hour for global commands, or kick/re-invite bot |
| "Nix not found" | Install: `sh <(curl -L https://nixos.org/nix/install) --daemon` |
| Permission denied | Enable intents in Discord Developer Portal |

## Project Structure

```
src/
├── index.ts              # Entry point
├── commands/             # Slash commands
│   ├── invites/         # Invite tracking
│   ├── rewards/         # Rewards system
│   ├── giveaways/       # Giveaways
│   └── ...
├── events/              # Discord events
├── utils/               # Utilities
└── languages/           # 16 languages
```

## File Checklist

- [ ] `.env` created with bot token
- [ ] `config.json` updated with bot ID
- [ ] MongoDB running (local or Docker)
- [ ] Dependencies installed (`npm install`)
- [ ] Bot invited to server
- [ ] Intents enabled in Developer Portal

## Documentation

- `README.md` - Main overview
- `SETUP.md` - Detailed setup guide
- `NIX-QUICKSTART.md` - Nix users (recommended)
- `CONTRIBUTING.md` - For developers
- `CHANGES.md` - What changed

## Production Checklist

- [ ] Set `"dev": false` in `config.json`
- [ ] Use `PROD_TOKEN` in `.env`
- [ ] Set up MongoDB with persistence
- [ ] Use PM2 or Docker for process management
- [ ] Configure reverse proxy if needed
- [ ] Set up monitoring/logging
- [ ] Back up database regularly

## Support

- 📖 Read the docs: `SETUP.md`
- 💬 Support server: https://discord.gg/7Q9nheNq2M
- 🐛 Report issues: GitHub Issues
- 🌐 Website: https://invite-rewards.xyz

---

**Pro Tip**: Use Nix for the smoothest experience! All dependencies managed automatically.

```bash
nix develop  # Everything just works™
```
