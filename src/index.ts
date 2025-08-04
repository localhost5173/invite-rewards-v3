import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { AutoPoster } from "topgg-autoposter";
import config from "../config.json" assert { type: "json" };
import { cs } from "./utils/console/customConsole.js";
import { db } from "./utils/db/db.js";
import { Giveaways } from "./utils/giveaways/Giveaways.js";
dotenv.config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
  ],
});

export const devMode = config.dev;
console.log("devMode", devMode);
if (devMode) {
  cs.info("Running in development mode.");
} else {
  cs.danger("Running in production mode.");
}          

// Define devGuildIds and devUserIds conditionally based on devMode
const devConfig = {
  devGuildIds: [],
  devUserIds: [],
};

// Global exception handlers
process.on('uncaughtException', (error) => {
  cs.error(`Uncaught Exception: ${error}`);
});
process.on('unhandledRejection', (reason, promise) => {
  cs.error(`Unhandled Rejection at ${promise}: ${reason}`);
});

// Handle client and shard errors
client.on('error', (error) => {
  cs.error(`Client Error: ${error}`);
});
client.on('shardError', (error) => {
  cs.error(`Shard Error: ${error}`);
});

// Initialte commandkit
new CommandKit({
  client,
  devGuildIds: devMode ? devConfig.devGuildIds : [],
  devUserIds: devMode ? devConfig.devUserIds : [],
  eventsPath: `${__dirname}/events`,
  commandsPath: `${__dirname}/commands`,
  validationsPath: `${__dirname}/validations`,
});

// Connect to database first, then login
async function startBot() {
  try {
    await db.connectToDatabase();
    await db.initializeFirestore();
    await client.login(devMode ? process.env.DEV_TOKEN : process.env.PROD_TOKEN);
    
    // Start giveaway checking after successful database connection
    setInterval(async () => {
      await Giveaways.checkForEndedGiveaways();
    }, 1000 * 10);
    
  } catch (error) {
    cs.error(`Error while connecting to MongoDB: ${error}`);
    process.exit(1);
  }
}

startBot();

// Handle top.gg autoposter
if (!devMode) {
  try {
    const autoPoster = AutoPoster(process.env.TOPGG_TOKEN || "", client);
    autoPoster.on("posted", () => {
      cs.success("Server count posted successfully.");
    });
  } catch (error) {
    cs.error(`Error posting server count: ${error}`);
  }
}