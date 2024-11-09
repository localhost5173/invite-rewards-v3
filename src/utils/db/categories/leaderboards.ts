import LeaderboardResetModel from "../models/leaderboardReset";
import LeaderboardUserModel from "../models/leaderboardUsers";

export class leaderboards {
  static async getTopEntries(
    guildId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    return LeaderboardUserModel.find({ guildId, leaderboardType })
      .sort({ inviteCount: -1 })
      .limit(25);
  }

  static async updateEntry(
    guildId: string,
    userId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime",
    inviteCount: number
  ) {
    // Upsert user's invite count
    await LeaderboardUserModel.updateOne(
      { guildId, userId, leaderboardType },
      { inviteCount },
      { upsert: true }
    );
  }

  static async deleteLowestEntry(
    guildId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    // Remove the lowest entry (11th position)
    const lowest = await LeaderboardUserModel.find({ guildId, leaderboardType })
      .sort({ inviteCount: -1 })
      .skip(10)
      .limit(1);

    if (lowest.length > 0) {
      await LeaderboardUserModel.deleteOne({ _id: lowest[0]._id });
    }
  }

  static async getLeaderboard(
    guildId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    return LeaderboardUserModel.find({ guildId, leaderboardType })
      .sort({ inviteCount: -1 })
      .limit(10);
  }

  static async deleteUserEntry(
    guildId: string,
    userId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    await LeaderboardUserModel.deleteOne({ guildId, userId, leaderboardType });
  }

  static async resetTimedLeaderboard(
    leaderboardType: "daily" | "weekly" | "monthly"
  ) {
    await LeaderboardUserModel.deleteMany({ leaderboardType });
  }

  static async setLastLeaderboardReset(
    leaderboardType: "daily" | "weekly" | "monthly"
  ) {
    await LeaderboardResetModel.updateOne(
      { leaderboardType },
      { lastReset: new Date() },
      { upsert: true }
    );
  }

  static async getLastLeaderboardReset(
    leaderboardType: "daily" | "weekly" | "monthly"
  ) {
    const reset = await LeaderboardResetModel.findOne({ leaderboardType });

    return reset?.lastReset;
  }
}
