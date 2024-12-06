import LeaderboardUserModel from "../models/leaderboardUsers.js";
import SmartLeaderboardModel from "../models/smartLeaderboardModel.js";
export class leaderboards {
    static async getTopEntries(guildId, leaderboardType) {
        return LeaderboardUserModel.find({ guildId, leaderboardType })
            .sort({ inviteCount: -1 })
            .limit(25);
    }
    static async updateEntry(guildId, userId, leaderboardType, inviteCount) {
        // Upsert user's invite count
        await LeaderboardUserModel.updateOne({ guildId, userId, leaderboardType }, { inviteCount }, { upsert: true });
    }
    static async deleteLowestEntry(guildId, leaderboardType) {
        // Remove the lowest entry (11th position)
        const lowest = await LeaderboardUserModel.find({ guildId, leaderboardType })
            .sort({ inviteCount: -1 })
            .skip(10)
            .limit(1);
        if (lowest.length > 0) {
            await LeaderboardUserModel.deleteOne({ _id: lowest[0]._id });
        }
    }
    static async getLeaderboard(guildId, leaderboardType) {
        return LeaderboardUserModel.find({ guildId, leaderboardType })
            .sort({ inviteCount: -1 })
            .limit(10);
    }
    static async deleteUserEntry(guildId, userId, leaderboardType) {
        await LeaderboardUserModel.deleteMany({ guildId, userId, leaderboardType });
    }
    static async resetTimedLeaderboard(leaderboardType) {
        await LeaderboardUserModel.deleteMany({ leaderboardType });
    }
    static async saveSmart(guildId, channelId, messageId, leaderboardType) {
        const doc = new SmartLeaderboardModel({
            guildId,
            channelId,
            messageId,
            leaderboardType,
        });
        await doc.save();
    }
    static async getSmart(guildId) {
        return SmartLeaderboardModel.find({ guildId });
    }
    static async getSmartByType(guildId, leaderboardType) {
        return SmartLeaderboardModel.find({ guildId, leaderboardType });
    }
    static async deleteSmart(guildId, channelId, messageId) {
        await SmartLeaderboardModel.deleteOne({ guildId, channelId, messageId });
    }
    static async deleteNegative(guildId, leaderboardType) {
        await LeaderboardUserModel.deleteMany({
            guildId,
            inviteCount: { $lt: 1 },
            leaderboardType,
        });
    }
    static async isSmartLeaderboardMessage(guildId, channelId, messageId) {
        const count = await SmartLeaderboardModel.countDocuments({
            guildId,
            channelId,
            messageId,
        });
        return count > 0;
    }
    static async deleteSmartByChannelId(guildId, channelId) {
        await SmartLeaderboardModel.deleteMany({ guildId, channelId });
    }
    static async getSmartLeaderboards(guildId) {
        return SmartLeaderboardModel.find({ guildId });
    }
    static async deleteAllSmartLeaderboards(guildId) {
        await SmartLeaderboardModel.deleteMany({ guildId });
    }
}
