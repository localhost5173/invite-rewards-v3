import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Resets } from "../../utils/resets/Resets.js";

export default async function () {
  const now = new Date();

  try {
    // Daily tasks reset
    const dailyLockAcquired = await db.locks.acquireLock("resetPastDueDailyTasks");
    if (dailyLockAcquired) {
      try {
        const lastDailyReset = await db.resets.getLastDailyReset();
        if (
          !lastDailyReset ||
          now.getTime() - new Date(lastDailyReset).getTime() > 24 * 60 * 60 * 1000
        ) {
          await Resets.resetDaily();
          cs.log("Daily tasks reset successfully after downtime.");
        }
      } catch (error) {
        cs.error("Error during daily reset: " + error);
      } finally {
        await db.locks.releaseLock("resetPastDueDailyTasks");
      }
    }

    // Weekly tasks reset
    const weeklyLockAcquired = await db.locks.acquireLock("resetPastDueWeeklyTasks");
    if (weeklyLockAcquired) {
      try {
        const lastWeeklyReset = await db.resets.getLastWeeklyReset();
        if (
          !lastWeeklyReset ||
          now.getTime() - new Date(lastWeeklyReset).getTime() > 7 * 24 * 60 * 60 * 1000
        ) {
          await Resets.resetWeekly();
          cs.log("Weekly tasks reset successfully after downtime.");
        }
      } catch (error) {
        cs.error("Error during weekly reset: " + error);
      } finally {
        await db.locks.releaseLock("resetPastDueWeeklyTasks");
      }
    }

    // Monthly tasks reset
    const monthlyLockAcquired = await db.locks.acquireLock("resetPastDueMonthlyTasks");
    if (monthlyLockAcquired) {
      try {
        const lastMonthlyReset = await db.resets.getLastMonthlyReset();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        if (!lastMonthlyReset || new Date(lastMonthlyReset) < oneMonthAgo) {
          await Resets.resetMonthly();
          cs.log("Monthly tasks reset successfully after downtime.");
        }
      } catch (error) {
        cs.error("Error during monthly reset: " + error);
      } finally {
        await db.locks.releaseLock("resetPastDueMonthlyTasks");
      }
    }
  } catch (error) {
    cs.error("Error resetting tasks: " + error);
  }
}