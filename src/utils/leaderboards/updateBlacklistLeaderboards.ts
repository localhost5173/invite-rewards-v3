import { devMode } from "../../index.js";
import { getUserInvites } from "../../firebase/invites.js";
import {
  getLeaderboardByType,
  isBlacklisted,
  updateLeaderboard,
} from "../../firebase/leaderboards.js";

export default async function updateBlacklistLeaderboards(guildId: string) {
  const allTimeLeaderboard = await remakeAllTimeLeaderboard(guildId);
  const dailyLeaderboard = await getLeaderboardByType(guildId, "daily");
  const weeklyLeaderboard = await getLeaderboardByType(guildId, "weekly");
  const monthlyLeaderboard = await getLeaderboardByType(guildId, "monthly");

  devMode ?? console.log("Recalculating leaderboards...");

  // Remove blacklisted users from timed leaderboards
  try {
    devMode ?? console.log("Daily leaderboard: ", dailyLeaderboard);
    const newDailyLeaderboard = await removeBlacklistedUsers(
      dailyLeaderboard,
      guildId
    );
    devMode ?? console.log("New daily leaderboard: ", newDailyLeaderboard);
    const newWeeklyLeaderboard = await removeBlacklistedUsers(
      weeklyLeaderboard,
      guildId
    );
    const newMonthlyLeaderboard = await removeBlacklistedUsers(
      monthlyLeaderboard,
      guildId
    );
    const newAllTimeLeaderboard = await remakeAllTimeLeaderboard(guildId);

    await updateLeaderboard(guildId, "daily", newDailyLeaderboard);
    await updateLeaderboard(guildId, "weekly", newWeeklyLeaderboard);
    await updateLeaderboard(guildId, "monthly", newMonthlyLeaderboard);
    await updateLeaderboard(guildId, "allTime", newAllTimeLeaderboard);

    devMode ?? console.log("Leaderboards recalculated successfully!");
  } catch (error) {
    console.error("Error updating leaderboards for blacklist: ", error);
  }
}

// Rebuild the all-time leaderboard by summing real and fake invites for each user
async function remakeAllTimeLeaderboard(guildId: string) {
    try {
      // Fetch all user invites
      const userInvites = await getUserInvites(guildId);
  
      devMode ?? console.log("User invites: ", userInvites);
  
      // Process the invites to create a leaderboard
      const leaderboard = [];
      for (const invite of userInvites) {
        const blacklisted = await isBlacklisted(guildId, invite.userId);
        if (!blacklisted) {
          leaderboard.push({
            userId: invite.userId,
            invites: (invite.fake || 0) + (invite.real || 0), // Assuming 'fake' represents the number of invites
          });
        }
      }
  
      devMode ?? console.log("Filtered Leaderboard: ", leaderboard);
  
      // Sort the leaderboard by the number of invites in descending order
      leaderboard.sort((a, b) => b.invites - a.invites);

      devMode ?? console.log("Sorted Leaderboard: ", leaderboard);
  
      return leaderboard;
    } catch (error) {
      console.error(
        `Failed to remake all-time leaderboard for guild ${guildId}:`,
        error
      );
    }
  }

// Remove blacklisted users from a given leaderboard (daily, weekly, monthly)
async function removeBlacklistedUsers(leaderboard: any[], guildId: string) {
  const filteredLeaderboard = [];

  for (const entry of leaderboard) {
    const isUserBlacklisted = await isBlacklisted(guildId, entry.userId);
    if (!isUserBlacklisted) {
      filteredLeaderboard.push(entry);
    }
  }

  return filteredLeaderboard;
}
