import cron from "node-cron";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function() {
  // Schedule the cron job to run at midnight UTC
  cron.schedule("0 0 * * *", resetLeaderboards, {
    timezone: "UTC",
  });


cs.dev("Cron job for resetting leaderboards scheduled.");
}

// Function to reset leaderboards
async function resetLeaderboards() {
  try {
    // Reset daily leaderboard
    await db.leaderboards.resetTimedLeaderboard("daily");
    await db.leaderboards.setLastLeaderboardReset("daily");
    cs.log("Daily leaderboards reset successfully.");

    // Reset weekly leaderboard if it's Monday
    const now = new Date();
    if (now.getUTCDay() === 1) {
      await db.leaderboards.resetTimedLeaderboard("weekly");
      await db.leaderboards.setLastLeaderboardReset("weekly");
      cs.log("Weekly leaderboards reset successfully.");
    }

    // Reset monthly leaderboard if it's the first day of the month
    if (now.getUTCDate() === 1) {
      await db.leaderboards.resetTimedLeaderboard("monthly");
      await db.leaderboards.setLastLeaderboardReset("monthly");
      cs.log("Monthly leaderboards reset successfully.");
    }
  } catch (error) {
    cs.error("Error resetting leaderboards: " + error);
  }
}
