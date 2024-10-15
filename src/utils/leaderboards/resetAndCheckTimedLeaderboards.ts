import { Guild } from "discord.js";
import { client, devMode } from "../../index.js";
import { clearLeaderboard } from "../../firebase/leaderboards.js";

export default async function resetAndCheckTimedLeaderboards() {
  const now = new Date();

  // Check if it's the start of a new day (midnight)
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    devMode ?? console.log("Daily leaderboard reset triggered");
    const guildIds = client.guilds.cache.map((guild: Guild) => guild.id);
    await Promise.all(
      guildIds.map(async (guildId) => {
        await clearLeaderboard(guildId, "daily");
      })
    );
  }

  // Check if it's the start of a new week (Sunday midnight)
  if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
    devMode ?? console.log("Weekly leaderboard reset triggered");
    const guildIds = client.guilds.cache.map((guild: Guild) => guild.id);
    await Promise.all(
      guildIds.map(async (guildId) => {
        await clearLeaderboard(guildId, "weekly");
      })
    );
  }

  // Check if it's the start of a new month (first day of the month at midnight)
  if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
    devMode ?? console.log("Monthly leaderboard reset triggered");
    const guildIds = client.guilds.cache.map((guild: Guild) => guild.id);
    await Promise.all(
      guildIds.map(async (guildId) => {
        await clearLeaderboard(guildId, "monthly");
      })
    );
  }
}
