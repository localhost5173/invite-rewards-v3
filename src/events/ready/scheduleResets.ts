import cron from "node-cron";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import monthly from "../../utils/resets/monthly";
import weekly from "../../utils/resets/weekly";
import daily from "../../utils/resets/daily";

export default async function () {
  // Schedule the cron job to run daily at midnight UTC
  cron.schedule(
    "0 0 * * *",
    async () => {
      const lockAcquired = await db.locks.acquireLock("resetDailyTasks");
      if (lockAcquired) {
        await daily();
        await db.locks.releaseLock("resetDailyTasks");
      }
    },
    {
      timezone: "UTC",
    }
  );

  // Schedule the cron job to run weekly on Monday at midnight UTC
  cron.schedule(
    "0 0 * * 1",
    async () => {
      const lockAcquired = await db.locks.acquireLock("resetWeeklyTasks");
      if (lockAcquired) {
        await weekly();
        await db.locks.releaseLock("resetWeeklyTasks");
      }
    },
    {
      timezone: "UTC",
    }
  );

  // Schedule the cron job to run monthly on the first day of the month at midnight UTC
  cron.schedule(
    "0 0 1 * *",
    async () => {
      const lockAcquired = await db.locks.acquireLock("resetMonthlyTasks");
      if (lockAcquired) {
        await monthly();
        await db.locks.releaseLock("resetMonthlyTasks");
      }
    },
    {
      timezone: "UTC",
    }
  );

  cs.dev("Cron jobs for resetting tasks scheduled.");
}