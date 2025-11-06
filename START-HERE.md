# 🚀 START HERE - First Time Setup

## You're almost ready! Just 2 steps:

### Step 1: Get Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Click "New Application" (give it a name like "Invite Rewards")
3. Go to "Bot" tab on the left
4. Click "Reset Token" (or "Copy" if you see it)
5. **Copy the token** - you'll need it in Step 2

### Step 2: Add Token to .env File

Open the `.env` file and replace the placeholder tokens:

```bash
nano .env
# or use any text editor
```

Change these lines:
```env
DEV_TOKEN=your_dev_bot_token_here
PROD_TOKEN=your_prod_bot_token_here
```

To:
```env
DEV_TOKEN=YOUR_ACTUAL_TOKEN_FROM_STEP_1
PROD_TOKEN=YOUR_ACTUAL_TOKEN_FROM_STEP_1
```

**Save the file!**

### Step 3: Enable Bot Intents

Back in Discord Developer Portal:
1. Go to "Bot" tab
2. Scroll down to "Privileged Gateway Intents"
3. Enable these:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
4. Click "Save Changes"

### Step 4: Run the Bot

Now you can start everything with Docker:

```bash
docker compose up --build
```

Or run locally:

```bash
# Start MongoDB first
docker run -d -p 27017:27017 --name mongodb mongo:6

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Step 5: Invite Bot to Your Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ `bot`
3. Select bot permissions:
   - ✅ Administrator (or specific permissions you need)
4. Copy the generated URL and open it in your browser
5. Select a server and authorize

### Step 6: Test!

In your Discord server, try:
```
/help
/invite
```

## Troubleshooting

**"Invalid token"**
- Make sure you copied the entire token
- No extra spaces before/after the token in .env
- Token should start with `MTI...` or similar

**"Cannot connect to MongoDB"**
- For Docker: Just run `docker compose up --build`
- For local: Start MongoDB first with `docker run -d -p 27017:27017 --name mongodb mongo:6`

**"Bot is offline"**
- Check the console for errors
- Make sure intents are enabled in Discord Developer Portal
- Wait a few seconds for the bot to connect

## Need More Help?

- Read `SETUP.md` for detailed instructions
- Read `QUICKREF.md` for quick commands
- Check `README.md` for overview
