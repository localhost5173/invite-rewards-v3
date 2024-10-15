import { devMode } from "../../index.js";
import { getTotalInvitesForUser } from "../../firebase/invites.js";
import {
  getLeaderboardByType,
  updateLeaderboard,
  isBlacklisted,
} from "../../firebase/leaderboards.js";

export default async function updateAllTimeLeaderboard(
  guildId: string,
  userId: string
) {
  try {
    // Check if the user is blacklisted
    const blacklisted = await isBlacklisted(guildId, userId);
    if (blacklisted) {
      devMode ?? console.log(
        `User ${userId} is blacklisted in guild ${guildId}, skipping leaderboard update.`
      );
      return;
    }

    // Fetch the user's total invites
    const totalInvites = await getTotalInvitesForUser(guildId, userId);
    if (totalInvites === null || totalInvites === undefined) {
      devMode ?? console.log(
        `No invite data available for user ${userId} in guild ${guildId}`
      );
      return;
    }

    const leaderboard = await getLeaderboardByType(guildId, "allTime");
    devMode && console.log("Leaderboard: ", leaderboard);

    // Find if the user is already on the leaderboard
    const userIndex = leaderboard.findIndex((entry) => entry.userId === userId);

    if (userIndex > -1) {
      // Update the user's invite count
      leaderboard[userIndex].invites = totalInvites;
    } else {
      // Add the user to the leaderboard if they aren't already on it
      leaderboard.push({ userId, invites: totalInvites });
    }

    // Sort the leaderboard by invites in descending order
    leaderboard.sort((a, b) => b.invites - a.invites);

    // Update the leaderboard in the database
    await updateLeaderboard(guildId, "allTime", leaderboard);

    devMode ?? console.log(`Updated leaderboards for user ${userId} in guild ${guildId}`);
  } catch (error) {
    console.error(
      `Failed to update leaderboards for user ${userId} in guild ${guildId}:`,
      error
    );
  }
}