import LeaderboardUserModel from "../models/leaderboardUsers.js";
import SmartLeaderboardModel from "../models/smartLeaderboardModel.js";

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
    await LeaderboardUserModel.deleteMany({ guildId, userId, leaderboardType });
  }

  static async resetTimedLeaderboard(
    leaderboardType: "daily" | "weekly" | "monthly"
  ) {
    await LeaderboardUserModel.deleteMany({ leaderboardType });
  }

  static async saveSmart(
    guildId: string,
    channelId: string,
    messageId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    const doc = new SmartLeaderboardModel({
      guildId,
      channelId,
      messageId,
      leaderboardType,
    });

    await doc.save();
  }

  static async getSmart(guildId: string) {
    return SmartLeaderboardModel.find({ guildId });
  }

  static async getSmartByType(
    guildId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    return SmartLeaderboardModel.find({ guildId, leaderboardType });
  }

  static async deleteSmart(
    guildId: string,
    channelId: string,
    messageId: string
  ) {
    await SmartLeaderboardModel.deleteOne({ guildId, channelId, messageId });
  }

  static async deleteNegative(
    guildId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
  ) {
    await LeaderboardUserModel.deleteMany({
      guildId,
      inviteCount: { $lt: 1 },
      leaderboardType,
    });
  }

  static async isSmartLeaderboardMessage(
    guildId: string,
    channelId: string,
    messageId: string
  ): Promise<boolean> {
    const count = await SmartLeaderboardModel.countDocuments({
      guildId,
      channelId,
      messageId,
    });

    return count > 0;
  }

  static async deleteSmartByChannelId(guildId: string, channelId: string) {
    await SmartLeaderboardModel.deleteMany({ guildId, channelId });
  }

  static async getSmartLeaderboards(guildId: string) {
    return SmartLeaderboardModel.find({ guildId });
  }

  static async deleteAllSmartLeaderboards(guildId: string) {
    await SmartLeaderboardModel.deleteMany({ guildId });
  }
}
