import { client, devMode } from "../../index.js";
import { cs } from "../console/customConsole.js";
import { db } from "../db/db.js";

export default async function () {
  if (devMode) return;
  let after = null;
  const allGuilds = [];

  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guilds: any = await client.guilds.fetch({ after });
    allGuilds.push(...guilds.values());
    after = guilds.size > 0 ? guilds.lastKey() : null; // Get last guild ID for pagination
  } while (after);

  cs.log("Guilds length: " + allGuilds.length);

  let totalMembers = 0;
  for (const guild of allGuilds) {
    try {
      // Fetch full guild data for member count
      const fullGuild = await client.guilds.fetch(guild.id);
      db.guilds.updateGuild(fullGuild);
      totalMembers += fullGuild.memberCount || 0; // Use 0 if memberCount is undefined
    } catch (error) {
      console.error(`Failed to fetch full guild data for ${guild.id}:`, error);
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