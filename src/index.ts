import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";
import { AutoPoster } from "topgg-autoposter";
import "jsr:@std/dotenv/load";
import config from "../config.json" with { type: "json" };

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

export let devMode: boolean = false;
if (config.dev) {
  console.info("✅ Running in DEVELOPMENT mode.");
  devMode = true;
} else {
  console.info("❗❗❗❗❗Running in production mode.❗❗❗❗❗");
}

// Define devGuildIds and devUserIds conditionally based on devMode
const devConfig = {
  devGuildIds: ["1280127706545000542"],
  devUserIds: [
    "689150586636992526",
    "975766583446212648",
    "967483551882829894",
  ],
};

const __dirname = new URL('.', import.meta.url).pathname;
new CommandKit({
  client,
  ...devConfig, // Spread the devConfig conditionally
  eventsPath: `${__dirname}/events`,
  commandsPath: `${__dirname}/commands`,
});

// Initialize Firebase
try {
  console.log("Initializing Firebase...");
  // initFirebase(devMode);
  console.log("Firebase initialized successfully!");
} catch (error) {
  console.error("Failed to initialize Firebase: ", error);
}


client.login(devMode ? Deno.env.get("DEV_TOKEN") : Deno.env.get("PROD_TOKEN"));

// // check timed leaderboards for reset every 30 seconds
// setInterval(resetAndCheckTimedLeaderboards, 30 * 1000); // 30 * 1000 ms = 0.5 minute

// // check for ended giveaways every 10 minutes
// setInterval(checkForEndedGiveaways, 60 * 1000); // 60 * 1000 ms = 1 minute

// Handle top.gg autoposter
if (!devMode) {
  try {
    const ap = AutoPoster(Deno.env.get("TOPGG_TOKEN") || "", client);
    ap.on("posted", () => {
      console.log("Server count posted!");
    });
  } catch (error) {
    console.error("Failed to initialize top.gg autoposter: ", error);
  }
}

// Fetch all invites for a guild when joined
// client.on("guildCreate", async (guild) => {
//   guildCreate(client, guild);
//   getAndStoreInvites(guild);
// });