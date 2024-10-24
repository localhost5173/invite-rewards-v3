import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { AutoPoster } from "topgg-autoposter";
import config from "../config.json";
import { cs } from "./utils/console/customConsole";
import { db } from "./utils/db/db";
dotenv.config({ path: ".env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

export const devMode = config.dev || true;
if (devMode) {
  cs.info("Running in development mode.");
} else {
  cs.danger("Running in production mode.");
}

// Define devGuildIds and devUserIds conditionally based on devMode
const devConfig = {
  devGuildIds: ["1280127706545000542", "1282752750253375558"],
  devUserIds: [
    "689150586636992526",
    "975766583446212648",
    "967483551882829894",
  ],
};

// Initialte commandkit
new CommandKit({
  client,
  devGuildIds: devMode ? devConfig.devGuildIds : [],
  devUserIds: devMode ? devConfig.devUserIds : [],
  eventsPath: `${__dirname}/events`,
  commandsPath: `${__dirname}/commands`,
  validationsPath: `${__dirname}/validations`,
});

client.login(devMode ? process.env.DEV_TOKEN : process.env.PROD_TOKEN);

db.connectToDatabase();

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