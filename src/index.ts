import { AutoPoster } from "topgg-autoposter";
import "jsr:@std/dotenv/load";
import config from "../config.json" with { type: "json" };
import { Client as Eris, ClientOptions } from "eris";

const botToken = Deno.env.get("DEV_TOKEN") || "";
const topggToken = Deno.env.get("TOPGG_TOKEN") || "";
export let devMode: boolean = false;
if (!botToken) {
  throw new Error("DEV_TOKEN is not set in the environment variables.");
}

if (config.dev) {
  console.info("✅ Running in DEVELOPMENT mode.");
  devMode = true;
} else {
  console.info("❗❗❗❗❗Running in production mode.❗❗❗❗❗");
}

// Initialize the client
export const client = new Eris(botToken, {
  intents: [
    "guilds",
    "guildMembers",
    "guildInvites",
  ]
} as ClientOptions);

// Handle top.gg autoposter
if (!devMode) {
  try {
    const autoPoster = AutoPoster(topggToken, client);
    autoPoster.on("posted", () => {
      console.log("Server count posted!");
    });
  } catch (error) {
    console.error("Failed to initialize top.gg autoposter: ", error);
  }
}

client.on("ready", () => {
  console.log("Ready!");
});

client.connect();

// Keep the bot alive
setInterval(() => {}, 1000);