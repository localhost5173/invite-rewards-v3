import { ClusterManager, ClusterManagerOptions } from "discord-hybrid-sharding";
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

// Configure ClusterManager
const clusterConfig = {
  totalShards: devMode ? 5 : "auto", // Auto-calculated shards for production
  shardsPerClusters: devMode ? 1 : 2, // Use more shards per cluster in production
  mode: "process", // Use process mode
  token,
};

const manager = new ClusterManager(
  `${__dirname}/bot.js`,
  clusterConfig as ClusterManagerOptions
);

// Log cluster creation events
manager.on("clusterCreate", (cluster) => {
  console.log(`[Cluster Manager] Launched Cluster ${cluster.id}`);
});

// Spawn clusters with error handling
(async () => {
  try {
    console.log("[Cluster Manager] Spawning clusters...");
    await manager.spawn({ timeout: -1 });
    console.log("[Cluster Manager] All clusters launched successfully!");
  } catch (error) {
    console.error("[Cluster Manager] Failed to launch clusters:", error);
    process.exit(1); // Exit the process with failure
  }
})();