import cron from "node-cron";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function () {
  // Schedule the cron job to run at midnight UTC
  cron.schedule(
    "0 0 * * *",
    async () => {
      const lockAcquired = await db.locks.acquireLock(
        "resetLeaderboardsAndInvites"
      );
      if (lockAcquired) {
        await resetLeaderboardsAndInvites();
        await db.locks.releaseLock("resetLeaderboardsAndInvites");
      }
    },
    {
      timezone: "UTC",
    }
  );

  cs.dev("Cron job for resetting leaderboards and invites scheduled.");
}

// Function to reset leaderboards
async function resetLeaderboardsAndInvites() {
  try {
    // Reset daily leaderboard
    await db.leaderboards.resetTimedLeaderboard("daily");
    await db.leaderboards.setLastLeaderboardReset("daily");

    // Reset daily invites
    await db.invites.userInvites.resetTimedInvites("daily");
    await db.invites.userInvites.setLastReset("daily");
    cs.log("Daily leaderboards reset successfully.");

    // Reset weekly leaderboard if it's Monday
    const now = new Date();
    if (now.getUTCDay() === 1) {
      await db.leaderboards.resetTimedLeaderboard("weekly");
      await db.leaderboards.setLastLeaderboardReset("weekly");

      // Reset weekly invites
      await db.invites.userInvites.resetTimedInvites("weekly");
      await db.invites.userInvites.setLastReset("weekly");

      cs.log("Weekly leaderboards reset successfully.");
    }

    // Reset monthly leaderboard if it's the first day of the month
    if (now.getUTCDate() === 1) {
      await db.leaderboards.resetTimedLeaderboard("monthly");
      await db.leaderboards.setLastLeaderboardReset("monthly");

      // Reset monthly invites
      await db.invites.userInvites.resetTimedInvites("monthly");
      await db.invites.userInvites.setLastReset("monthly");

      // Reset monthly reaction roles uses
      await db.reactionRoles.resetUses();
      await db.reactionRoles.setLastReset();

      cs.log("Monthly leaderboards reset successfully.");
    }
  } catch (error) {
    cs.error("Error resetting leaderboards: " + error);
  }
}