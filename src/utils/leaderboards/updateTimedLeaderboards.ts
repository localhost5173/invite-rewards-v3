import { devMode } from "../../index.js";
import {
  getLeaderboardByType,
  isBlacklisted,
  updateLeaderboard,
} from "../../firebase/leaderboards.js";

export default async function updateTimedLeaderboards(
  guildId: string,
  userId: string,
  inviteChange: number // Can be positive or negative based on the invite increase or decrease
) {
  try {
    const dailyLeaderboard = await getLeaderboardByType(guildId, "daily");
    const weeklyLeaderboard = await getLeaderboardByType(guildId, "weekly");
    const monthlyLeaderboard = await getLeaderboardByType(guildId, "monthly");

    if (await isBlacklisted(guildId, userId)) return;

    // Helper function to update a specific leaderboard
    function updateSpecificLeaderboard(leaderboard: any) {
      const existingEntryIndex = leaderboard.findIndex(
        (entry: any) => entry.userId === userId
      );

      if (existingEntryIndex !== -1) {
        // If the user is already on the leaderboard, update their invite count
        leaderboard[existingEntryIndex].invites += inviteChange;

        // If their invite count drops below or equal to 0, remove them from the leaderboard
        if (leaderboard[existingEntryIndex].invites <= 0) {
          leaderboard.splice(existingEntryIndex, 1);
        }
      } else if (inviteChange > 0) {
        // If the user is not on the leaderboard and the invite change is positive, add them
        leaderboard.push({
          userId,
          invites: inviteChange,
          date: new Date(),
        });
      }

      // Sort the leaderboard in descending order by invite count
      leaderboard.sort((a: any, b: any) => b.invites - a.invites);
      // updateSmartLeaderboards(guildId);
    }

    // Update the daily leaderboard
    updateSpecificLeaderboard(dailyLeaderboard);
    updateSpecificLeaderboard(weeklyLeaderboard);
    updateSpecificLeaderboard(monthlyLeaderboard);

    // Save the updated guild document
    await Promise.all([
      updateLeaderboard(guildId, "daily", dailyLeaderboard),
      updateLeaderboard(guildId, "weekly", weeklyLeaderboard),
      updateLeaderboard(guildId, "monthly", monthlyLeaderboard),
    ]);

    devMode ?? console.log(
      `Leaderboards updated for guild ${guildId} and user ${userId} with invite change of ${inviteChange}.`
    );
  } catch (error) {
    console.error("Failed to update leaderboards on invite change:", error);
  }
}