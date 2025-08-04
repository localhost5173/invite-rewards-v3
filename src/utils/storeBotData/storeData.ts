import { Guild } from "discord.js";
import { client, devMode } from "../../index.js";
import { cs } from "../console/customConsole.js";
import { db } from "../db/db.js";

export default async function () {
  if (devMode) return;

  const uniqueGuilds = new Map<string, Guild>();

  try {
    // Fetch guild data from all shards
    if (!client.shard) {
      console.error("Shard client is not initialized.");
      return;
    }

    const results = await client.shard.broadcastEval((shardClient) => {
      return shardClient.guilds.cache;
    });

    // Flatten the results and aggregate the member counts and guilds
    results.forEach((result) => {
      result.forEach((guild: Guild) => {
        uniqueGuilds.set(guild.id, guild);
      });
    });

    cs.log("Total guilds fetched: " + uniqueGuilds.size);
  } catch (error) {
    console.error("Error fetching guild data from shards:", error);
  }

  // Now fetch full data for each guild (if not already)
  for (const guild of uniqueGuilds.values()) {
    try {
      await db.guilds.updateGuild(guild);
    } catch (error) {
      console.error(`Failed to fetch full guild data:`, error);
    }
  }

  const dbGuilds = await db.guilds.getGuilds();
  const totalMembers = dbGuilds.reduce((acc, guild) => acc + guild.memberCount, 0);

  const data = {
    serverCount: uniqueGuilds.size,
    userCount: totalMembers,
    timestamp: new Date().toISOString(), // Add timestamp for time-series data
  };

  // Save the data in Firestore
  if (!db.firestore) {
    cs.error("Firestore is not initialized.");
    return;
  }

  // Save the latest data in the "data" document
  await db.firestore.collection("bot").doc("data").set({
    serverCount: data.serverCount,
    userCount: data.userCount,
  });

  // Save the time-series data point
  await db.firestore.collection("botGrowth").add(data);

  console.log("Data saved to Firestore:", data);
}