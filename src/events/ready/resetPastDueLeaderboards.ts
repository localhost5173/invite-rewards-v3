import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";

// Define a type alias for the leaderboard types
type LeaderboardType = "daily" | "weekly" | "monthly";

export default async function () {
  const leaderboardTypes: LeaderboardType[] = ["daily", "weekly", "monthly"];

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
          cs.log("Daily leaderboards reset successfully after downtime.");
        }
        break;
      case "weekly":
        if (now.getTime() - lastResetDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
          await db.leaderboards.resetTimedLeaderboard("weekly");
          cs.log("Weekly leaderboards reset successfully after downtime.");
        }
        break;
      case "monthly": {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        if (lastResetDate < oneMonthAgo) {
          await db.leaderboards.resetTimedLeaderboard("monthly");
          cs.log("Monthly leaderboards reset successfully after downtime.");
        }
        break;
      }
    }
  }
}
