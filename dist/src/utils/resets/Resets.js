import { cs } from "../console/customConsole.js";
import { db } from "../db/db.js";
export class Resets {
    static async resetMonthly() {
        await db.leaderboards.resetTimedLeaderboard("monthly");
        await db.invites.userInvites.resetTimedInvites("monthly");
        await db.reactionRoles.resetUses();
        await db.resets.setLastMonthlyReset();
        cs.log("Monthly tasks reset successfully.");
    }
    static async resetWeekly() {
        await db.leaderboards.resetTimedLeaderboard("weekly");
        await db.invites.userInvites.resetTimedInvites("weekly");
        await db.resets.setLastWeeklyReset();
        cs.log("Weekly tasks reset successfully.");
    }
    static async resetDaily() {
        await db.leaderboards.resetTimedLeaderboard("daily");
        await db.invites.userInvites.resetTimedInvites("daily");
        await db.resets.setLastDailyReset();
        cs.log("Daily tasks reset successfully.");
    }
}
