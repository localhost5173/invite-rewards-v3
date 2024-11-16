// Gets called every day at 00:00:00

import { cs } from "../console/customConsole";
import { db } from "../db/db";

export default async function () {
  // Reset daily leaderboard
  await db.leaderboards.resetTimedLeaderboard("daily");

  // Reset daily invites
  await db.invites.userInvites.resetTimedInvites("daily");

  await db.resets.setLastDailyReset();
  cs.log("Daily tasks reset successfully.");
}
