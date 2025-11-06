# Invite Rewards Discord Bot

A feature-rich Discord bot for tracking invites, managing rewards, giveaways, and more. Built with Discord.js v14, TypeScript, and MongoDB.

## 🌟 Features

- **Invite Tracking**: Track who invited whom to your server
- **Reward System**: Automatically assign roles based on invite counts
- **Giveaways**: Create and manage server giveaways
- **Auto Roles**: Automatically assign roles to new members
- **Reaction Roles**: Let users pick roles via reactions
- **Verification System**: Member verification functionality
- **Welcome/Farewell Messages**: Customizable welcome and goodbye messages
- **Leaderboards**: Track top inviters
- **Multi-language Support**: 16 languages supported
- **Vote Integration**: Top.gg vote tracking

## 📋 Prerequisites

Before running this bot, ensure you have:

- **Node.js** (v20 or higher recommended) - *Or use Nix (see below)*
- **MongoDB** (v6 or higher) - Either local installation or MongoDB Atlas
- **Discord Bot Token** - [Create one here](https://discord.com/developers/applications)
- **npm** package manager

### Using Nix (Recommended)

This project includes a Nix flake for reproducible development environments:

```bash
# Install Nix with flakes enabled
sh <(curl -L https://nixos.org/nix/install) --daemon

# Enable flakes
mkdir -p ~/.config/nix
echo "experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf

# Enter development environment (includes Node.js 20, npm, Docker, etc.)
nix develop
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/localhost5173/invite-rewards-v3.git
cd invite-rewards-v3
```

**If using Nix:**
```bash
# Enter development environment
nix develop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Discord Bot Tokens
DEV_TOKEN=your_development_bot_token_here
PROD_TOKEN=your_production_bot_token_here

# Server Configuration (optional)
VPS_IP=your_vps_ip_here

# API Keys (optional)
TOPGG_TOKEN=your_topgg_token_here
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/invite-rewards
# Or use MongoDB Atlas:
# MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/invite-rewards
```

### 4. Configure Bot Settings

Edit `config.json`:

```json
{
  "dev": false,  // Set to true for development mode
  "bot": {
    "logo": "https://your-bot-logo-url.png",
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

### 5. Run Locally

#### Development Mode

For development with auto-reload:

**With Nix:**
```bash
nix develop --command npm run dev
```

**Without Nix:**
```bash
npm run dev
```

This will:
- Watch for file changes
- Automatically recompile TypeScript
- Restart the bot on changes
- Copy language files to dist folder

#### Production Mode

Build and run for production:

```bash
# Build TypeScript files
npm run build

# Run the compiled bot
node dist/src/index.js
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

The easiest way to run the bot with MongoDB:

1. **Create `.env` file** with your bot tokens and configuration

2. **Start the services**:
   
   **With Nix:**
   ```bash
   nix develop --command docker-compose up -d
   ```
   
   **Without Nix:**
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   
   **With Nix:**
   ```bash
   nix develop --command docker-compose logs -f bot
   ```
   
   **Without Nix:**
   ```bash
   docker-compose logs -f bot
   ```

4. **Stop the services**:
   
   **With Nix:**
   ```bash
   nix develop --command docker-compose down
   ```
   
   **Without Nix:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes** (complete reset):
   
   **With Nix:**
   ```bash
   nix develop --command docker-compose down -v
   ```
   
   **Without Nix:**
   ```bash
   docker-compose down -v
   ```

### Manual Docker Build

Build and run the Docker container manually:

```bash
# Build the image
docker build -t invite-rewards-bot .

# Run with MongoDB connection
docker run -d \
  --name invite-rewards-bot \
  --env-file .env \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/invite-rewards \
  invite-rewards-bot
```

## 📁 Project Structure

```
invite-rewards-v3/
├── src/
│   ├── index.ts              # Main entry point
│   ├── commands/             # Bot slash commands
│   │   ├── invites/          # Invite tracking commands
│   │   ├── rewards/          # Reward management
│   │   ├── giveaways/        # Giveaway commands
│   │   ├── auto-roles/       # Auto role management
│   │   ├── reaction-roles/   # Reaction role setup
│   │   ├── verification/     # Verification system
│   │   ├── leaderboards/     # Leaderboard commands
│   │   └── ...
│   ├── events/               # Discord.js event handlers
│   │   ├── guildCreate/      # New server joins
│   │   ├── guildMemberAdd/   # New member joins
│   │   └── ...
│   ├── utils/
│   │   ├── db/               # Database models and utilities
│   │   ├── embeds/           # Embed builders
│   │   ├── helpers/          # Helper functions
│   │   └── ...
│   ├── languages/            # Multi-language JSON files
│   └── validations/          # Command validations
├── config.json               # Bot configuration
├── docker-compose.yaml       # Docker Compose setup
├── Dockerfile                # Docker build file
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🔧 Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically

### Development Mode vs Production Mode

Set `"dev": true` in `config.json` to run in development mode:
- Uses `DEV_TOKEN` from `.env`
- Disables Top.gg autoposter
- More verbose logging

Set `"dev": false` for production:
- Uses `PROD_TOKEN` from `.env`
- Enables Top.gg stats posting
- Production optimizations

## 🗄️ Database

The bot uses MongoDB with Mongoose ODM. The database structure includes:

- **Guilds**: Server configurations
- **Invites**: Invite tracking data
- **Rewards**: Role rewards configuration
- **Giveaways**: Active and past giveaways
- **Languages**: Per-guild language preferences
- **Verification**: Verification settings
- **Welcomer**: Welcome/farewell message configs
- **AutoRoles**: Auto role configurations
- **ReactionRoles**: Reaction role setups
- **Leaderboards**: Smart leaderboard configurations

## 🌍 Supported Languages

The bot supports 16 languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Russian (ru)
- Arabic (ar)
- Turkish (tr)
- Italian (it)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Hindi (hi)
- Thai (th)
- Vietnamese (vi)
- Indonesian (id)

## 🔐 Required Bot Permissions

The bot requires the following Discord permissions:
- Manage Roles
- Manage Channels
- Manage Server
- Create Invite
- Kick Members
- Ban Members
- View Channels
- Send Messages
- Manage Messages
- Embed Links
- Read Message History
- Add Reactions
- Use External Emojis

Permission integer: `395405454448`

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEV_TOKEN` | Yes* | Discord bot token for development |
| `PROD_TOKEN` | Yes* | Discord bot token for production |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `TOPGG_TOKEN` | No | Top.gg API token for vote tracking |
| `OPENAI_API_KEY` | No | OpenAI API key (if using AI features) |
| `VPS_IP` | No | Your server IP address |

*At least one token (DEV or PROD) is required depending on your mode

## 🐛 Troubleshooting

### Bot won't start
- Check that your `.env` file is properly configured
- Verify your bot token is correct
- Ensure MongoDB is running and accessible
- Check that all required permissions are granted

### Database connection issues
- Verify MongoDB is running: `mongosh` or check Docker container
- Check `MONGODB_URI` format in `.env`
- Ensure network connectivity to MongoDB

### Commands not appearing
- Wait up to 1 hour for global commands to register
- Try kicking and re-inviting the bot
- Check bot has proper permissions

### Docker issues
- Ensure Docker and Docker Compose are installed
- Check that ports 27017 is not in use
- View logs: `docker-compose logs -f`

## 🤝 Contributing

Contributions are welcome! Please contact localhost5173 via the [support server](https://discord.com/invite/7Q9nheNq2M) before making major changes.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is. If you use this bot, please ⭐ star the repository!

## 💬 Support

Need help? Join the [support server](https://discord.com/invite/7Q9nheNq2M) and contact localhost5173.

## 🔗 Links

- [Website](https://invite-rewards.xyz)
- [Guide](https://guide.invite-rewards.xyz)
- [Top.gg](https://top.gg/bot/1286013724729151559)
- [Support Server](https://discord.gg/7Q9nheNq2M)

---

⭐ If you find this project useful, please star it on GitHub!
