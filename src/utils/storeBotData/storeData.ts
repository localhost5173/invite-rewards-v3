/* eslint-disable @typescript-eslint/no-explicit-any */
import { Guild } from "discord.js";
import { client, devMode } from "../../bot.js";
import { cs } from "../console/customConsole.js";
import { db } from "../db/db.js";

export default async function () {
  if (devMode) return;

  let allGuilds: any = [];
  let totalMembers = 0;

  try {
    // Fetch guild data from all shards
    if (!client.shard) {
      console.error("Shard client is not initialized.");
      return;
    }
    const results = await client.shard.broadcastEval((shardClient: any) => {
      // Collect guilds and member count from each shard
      const shardData = shardClient.guilds.cache.map((guild: Guild) => ({
        guildId: guild.id,
        memberCount: guild.memberCount || 0
      }));

      return shardData;
    });

    // Flatten the results and aggregate the member counts and guilds
    results.forEach((shardResult: any) => {
      shardResult.forEach((guild: any) => {
        allGuilds.push(guild.guildId);
        totalMembers += guild.memberCount; // Add member count
      });
    });

    cs.log("Total guilds fetched: " + allGuilds.length);
  } catch (error) {
    console.error("Error fetching guild data from shards:", error);
  }

  // Remove duplicates from the guilds list (in case any guilds were reported multiple times across shards)
  allGuilds = [...new Set(allGuilds)];

  // Now fetch full data for each guild (if not already)
  for (const guildId of allGuilds) {
    try {
      // Fetch full guild data by ID
      const fullGuild = await client.guilds.fetch(guildId);
      await db.guilds.updateGuild(fullGuild);
    } catch (error) {
      console.error(`Failed to fetch full guild data for ${guildId}:`, error);
    }
  }

  const data = {
    serverCount: allGuilds.length,
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