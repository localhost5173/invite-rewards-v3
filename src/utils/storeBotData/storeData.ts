import { client } from "../../index.js";
import { cs } from "../console/customConsole.js";
import serviceAccount from "./invite-rewards-frontend-firebase-adminsdk-3xdcs-c34d02b3d8.json" assert { type: "json" };
import admin from "firebase-admin";

export default async function () {
  let after = null;
  const allGuilds = [];

  do {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guilds: any = await client.guilds.fetch({ after });
    allGuilds.push(...guilds.values());
    after = guilds.size > 0 ? guilds.lastKey() : null; // Get last guild ID for pagination
  } while (after);

  cs.log("Guilds length: " + allGuilds.length);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  const db = admin.firestore();

  let totalMembers = 0;
  for (const guild of allGuilds) {
    try {
      // Fetch full guild data for member count
      const fullGuild = await client.guilds.fetch(guild.id);
      totalMembers += fullGuild.memberCount || 0; // Use 0 if memberCount is undefined
    } catch (error) {
      console.error(`Failed to fetch full guild data for ${guild.id}:`, error);
    }
  }

  const data = {
    serverCount: allGuilds.length,
    userCount: totalMembers,
  };

  // Save the data in Firestore
  await db.collection("bot").doc("data").set(data);

  console.log("Data saved to Firestore:", data);
}
