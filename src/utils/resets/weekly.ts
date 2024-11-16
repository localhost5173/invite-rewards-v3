// Gets called every week on Monday at 00:00:00

import { cs } from "../console/customConsole";
import { db } from "../db/db";

export default async function() {
    await db.leaderboards.resetTimedLeaderboard("weekly");

    // Reset weekly invites
    await db.invites.userInvites.resetTimedInvites("weekly");

    await db.resets.setLastWeeklyReset();
    cs.log("Weekly tasks reset successfully.");
}