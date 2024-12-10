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
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { assert } from "console";

// Load environment variables
dotenv.config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Extend Client for custom cluster handling
class ExtendedClient extends Client {
  cluster!: ClusterClient;
}

export const client = new ExtendedClient({
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
  ],
});

export const devMode = config.dev || false;

console.log(devMode ? "Running in development mode." : "Running in production mode.");

// Dev-only settings
const devConfig = {
  devGuildIds: ["1280127706545000542", "1311352872117731399", "1313415357356183594"],
  devUserIds: ["689150586636992526", "975766583446212648", "967483551882829894"],
};

// Initialize CommandKit
new CommandKit({
  client,
  devGuildIds: devMode ? devConfig.devGuildIds : [],
  devUserIds: devMode ? devConfig.devUserIds : [],
  eventsPath: `${__dirname}/events`,
  commandsPath: `${__dirname}/commands`,
  validationsPath: `${__dirname}/validations`,
});

client.cluster = new ClusterClient(client);
client.login(devMode ? process.env.DEV_TOKEN : process.env.PROD_TOKEN);

// Database Initialization
db.connectToDatabase();
db.initializeFirestore();

// Handle top.gg autoposter in production
if (!devMode && process.env.TOPGG_TOKEN) {
  try {
    const autoPoster = AutoPoster(process.env.TOPGG_TOKEN, client);
    autoPoster.on("posted", () => {
      cs.success("Server count posted successfully.");
    });
  } catch (error) {
    cs.error(`Error posting server count: ${error}`);
  }
}

// Periodically check for ended giveaways
setInterval(async () => {
  await Giveaways.checkForEndedGiveaways();
}, 1000 * 10);
