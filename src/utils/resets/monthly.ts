// Gets called first day of every month at 00:00:00

import { cs } from "../console/customConsole";
import { db } from "../db/db";

export default async function () {
  // Reset monthly leaderboards
  await db.leaderboards.resetTimedLeaderboard("monthly");

  // Reset monthly invites
  await db.invites.userInvites.resetTimedInvites("monthly");

  // Reset monthly reaction roles uses
  await db.reactionRoles.resetUses();

  await db.resets.setLastMonthlyReset();
  cs.log("Monthly tasks reset successfully.");
}