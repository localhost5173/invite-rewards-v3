import { ShardingManager } from "discord.js";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config({ path: ".env" });

// Helper variables for resolving paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate essential environment variables
if (!process.env.DEV_TOKEN || !process.env.PROD_TOKEN) {
  throw new Error(
    "Missing DEV_TOKEN or PROD_TOKEN in environment variables. Please check your .env file."
  );
}

// Determine mode and token
const devMode = process.env.NODE_ENV !== "production";
const token = devMode ? process.env.DEV_TOKEN : process.env.PROD_TOKEN;

// Configure ShardingManager
const manager = new ShardingManager(`${__dirname}/bot.js`, {
  totalShards: devMode ? 4 : "auto", // Auto-calculated shards for production
  token,
});

// Log shard creation events
manager.on("shardCreate", (shard) => {
  console.log(`[Sharding Manager] Launched Shard ${shard.id}`);
});

// Spawn shards with error handling
(async () => {
  try {
    console.log("[Sharding Manager] Spawning shards...");
    await manager.spawn({ timeout: -1 });
    console.log("[Sharding Manager] All shards launched successfully!");
  } catch (error) {
    console.error("[Sharding Manager] Failed to launch shards:", error);
    process.exit(1); // Exit the process with failure
  }
})();