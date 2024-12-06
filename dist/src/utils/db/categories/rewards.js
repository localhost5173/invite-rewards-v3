import { RewardModel } from "../models/rewards.js";
export class rewards {
    static async addRoleReward(guildId, inviteThreshold, rewardName, roleId, removable) {
        await RewardModel.create({
            guildId,
            rewardName,
            inviteThreshold,
            rewardType: "role",
            roleId,
            removable,
        });
    }
    static async addMessageReward(guildId, inviteThreshold, rewardName, message) {
        await RewardModel.create({
            guildId,
            rewardName,
            inviteThreshold,
            rewardType: "message",
            message,
        });
    }
    static async addMessageStoreReward(guildId, inviteThreshold, rewardName, messageStore) {
        await RewardModel.create({
            guildId,
            rewardName,
            inviteThreshold,
            rewardType: "messageStore",
            messageStore,
        });
    }
    static async doesRewardExist(guildId, rewardName) {
        return await RewardModel.exists({ guildId, rewardName });
    }
    static async removeReward(guildId, rewardName) {
        await RewardModel.deleteOne({ guildId, rewardName });
    }
    static async getRewards(guildId) {
        return await RewardModel.find({ guildId });
    }
    static async setAsClaimed(guildId, rewardName, userId) {
        await RewardModel.updateOne({ guildId, rewardName }, { $push: { claimedBy: userId } });
    }
    static async unclaimReward(guildId, rewardName, userId) {
        await RewardModel.updateOne({ guildId, rewardName }, { $pull: { claimedBy: userId } });
    }
    static async shiftFirstMessageFromStore(guildId, rewardName) {
        const reward = await RewardModel.findOne({ guildId, rewardName });
        if (!reward || !reward.messageStore)
            return null;
        const message = reward.messageStore.shift();
        await reward.save();
        return message;
    }
    static async fillStore(guildId, rewardName, messages) {
        await RewardModel.updateOne({ guildId, rewardName }, { $push: { messageStore: { $each: messages } } });
    }
    static async isStore(guildId, rewardName) {
        const reward = await RewardModel.findOne({ guildId, rewardName });
        return reward?.rewardType === "messageStore";
    }
    static async getStoreSize(guildId, rewardName) {
        const reward = await RewardModel.findOne({ guildId, rewardName });
        return reward?.messageStore?.length ?? 0;
    }
}
