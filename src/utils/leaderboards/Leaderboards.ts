import { cs } from "../console/customConsole";
import { db } from "../db/db";

export class Leaderboards {
  static async updateLeaderboards(guildId: string, userId: string) {
    try {
      const newInviteCount =
        await db.invites.userInvites.getRealAndBonusInvites(guildId, userId);

      // Update each leaderboard type
      await updateLeaderboard(guildId, userId, newInviteCount, "daily");
      await updateLeaderboard(guildId, userId, newInviteCount, "weekly");
      await updateLeaderboard(guildId, userId, newInviteCount, "monthly");
      await updateLeaderboard(guildId, userId, newInviteCount, "alltime");
    } catch (error) {
      cs.error("Error while updating leaderboards: " + error);
    }
  }
}

async function updateLeaderboard(
  guildId: string,
  userId: string,
  inviteCount: number,
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
) {
  // Retrieve current top 25 entries
  const topEntries = await db.leaderboards.getTopEntries(
    guildId,
    leaderboardType
  );

  // Delete user's entry if they have no invites
  if (inviteCount <= 0) {
    await db.leaderboards.deleteUserEntry(guildId, userId, leaderboardType);
    return;
  }

  // Check if user qualifies for the top 25
  const qualifiesForTop25 =
    topEntries.length < 25 ||
    inviteCount > topEntries[topEntries.length - 1].inviteCount;

  if (qualifiesForTop25) {
    // Upsert user's invite count in the top 25
    await db.leaderboards.updateEntry(
      guildId,
      userId,
      leaderboardType,
      inviteCount
    );

    // If more than 25 entries, trim the lowest one
    if (topEntries.length >= 25) {
      await db.leaderboards.deleteLowestEntry(guildId, leaderboardType);
    }
  } else {
    // If user doesn't qualify, ensure they aren't in the leaderboard
    await db.leaderboards.deleteUserEntry(guildId, userId, leaderboardType);
  }
}
