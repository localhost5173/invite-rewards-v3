import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import daily from "../../utils/resets/daily";
import weekly from "../../utils/resets/weekly";
import monthly from "../../utils/resets/monthly";

export default async function () {
  const now = new Date();

  try {
    // Get all last resets
    const lastDailyReset = await db.resets.getLastDailyReset();
    const lastWeeklyReset = await db.resets.getLastWeeklyReset();
    const lastMonthlyReset = await db.resets.getLastMonthlyReset();

    // Check and reset daily tasks if needed
    if (
      !lastDailyReset ||
      now.getTime() - new Date(lastDailyReset).getTime() > 24 * 60 * 60 * 1000
    ) {
      await daily();
      await db.resets.setLastDailyReset();
      cs.log("Daily tasks reset successfully after downtime.");
    }

    // Check and reset weekly tasks if needed
    if (
      !lastWeeklyReset ||
      now.getTime() - new Date(lastWeeklyReset).getTime() >
        7 * 24 * 60 * 60 * 1000
    ) {
      await weekly();
      await db.resets.setLastWeeklyReset();
      cs.log("Weekly tasks reset successfully after downtime.");
    }

    // Check and reset monthly tasks if needed
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    if (!lastMonthlyReset || new Date(lastMonthlyReset) < oneMonthAgo) {
      await monthly();
      await db.resets.setLastMonthlyReset();
      cs.log("Monthly tasks reset successfully after downtime.");
    }
  } catch (error) {
    cs.error("Error resetting tasks: " + error);
  }
}