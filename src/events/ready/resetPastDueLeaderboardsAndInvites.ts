import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";

// Define a type alias for the leaderboard types
type Type = "daily" | "weekly" | "monthly";

export default async function () {
  const lockName = "resetPastDueLeaderboardsAndInvites";
  const lockAcquired = await db.locks.acquireLock(lockName);

  if (!lockAcquired) {
    cs.dev("Another shard is already running the reset operation.");
    return;
  }

  try {
    const leaderboardTypes: Type[] = ["daily", "weekly", "monthly"];
    const inviteTypes: Type[] = ["daily", "weekly", "monthly"];

    for (const leaderboardType of leaderboardTypes) {
      const lastReset = await db.leaderboards.getLastLeaderboardReset(
        leaderboardType
      );

      if (!lastReset) {
        cs.dev(`No last reset found for ${leaderboardType} leaderboard.`);
        await db.leaderboards.setLastLeaderboardReset(leaderboardType);
        continue;
      }

      const now = new Date();
      const lastResetDate = new Date(lastReset);

      switch (leaderboardType) {
        case "daily":
          if (now.getTime() - lastResetDate.getTime() > 24 * 60 * 60 * 1000) {
            await db.leaderboards.resetTimedLeaderboard("daily");
            await db.leaderboards.setLastLeaderboardReset("daily");
            cs.log("Daily leaderboards reset successfully after downtime.");
          }
          break;
        case "weekly":
          if (
            now.getTime() - lastResetDate.getTime() >
            7 * 24 * 60 * 60 * 1000
          ) {
            await db.leaderboards.resetTimedLeaderboard("weekly");
            await db.leaderboards.setLastLeaderboardReset("weekly");
            cs.log("Weekly leaderboards reset successfully after downtime.");
          }
          break;
        case "monthly": {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          if (lastResetDate < oneMonthAgo) {
            await db.leaderboards.resetTimedLeaderboard("monthly");
            await db.leaderboards.setLastLeaderboardReset("monthly");
            cs.log("Monthly leaderboards reset successfully after downtime.");
          }
          break;
        }
      }
    }

    for (const inviteType of inviteTypes) {
      const lastReset = await db.invites.userInvites.getLastReset(inviteType);

      if (!lastReset) {
        cs.dev(`No last reset found for ${inviteType} invites.`);
        await db.invites.userInvites.setLastReset(inviteType);
        continue;
      }

      const now = new Date();
      const lastResetDate = new Date(lastReset);

      switch (inviteType) {
        case "daily":
          if (now.getTime() - lastResetDate.getTime() > 24 * 60 * 60 * 1000) {
            await db.invites.userInvites.resetTimedInvites("daily");
            await db.invites.userInvites.setLastReset(inviteType);
            cs.log("Daily invites reset successfully after downtime.");
          }
          break;
        case "weekly":
          if (
            now.getTime() - lastResetDate.getTime() >
            7 * 24 * 60 * 60 * 1000
          ) {
            await db.invites.userInvites.resetTimedInvites("weekly");
            await db.invites.userInvites.setLastReset(inviteType);
            cs.log("Weekly invites reset successfully after downtime.");
          }
          break;
        case "monthly": {
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          if (lastResetDate < oneMonthAgo) {
            await db.invites.userInvites.resetTimedInvites("monthly");
            await db.invites.userInvites.setLastReset(inviteType);
            cs.log("Monthly invites reset successfully after downtime.");
          }
          break;
        }
      }
    }

    // Reset monthly reaction roles uses
    const now = new Date();
    const oneMonthAgo = new Date(now);
    const lastReset = await db.reactionRoles.getLastReset();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    if (!lastReset || lastReset < oneMonthAgo) {
      await db.reactionRoles.resetUses();
      await db.reactionRoles.setLastReset();
      cs.log("Monthly reaction roles uses reset successfully after downtime.");
    }

  } catch (error) {
    cs.error("Error resetting leaderboards and invites: " + error);
  } finally {
    await db.locks.releaseLock(lockName);
  }
}
