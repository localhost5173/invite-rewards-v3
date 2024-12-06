import RewardModel from "../models/rewards.js";

export class rewards {
  static async addRoleReward(
    guildId: string,
    inviteThreshold: number,
    rewardName: string,
    roleId: string,
    removable: boolean
  ) {
    await RewardModel.create({
      guildId,
      rewardName,
      inviteThreshold,
      rewardType: "role",
      roleId,
      removable,
    });
  }

  static async addMessageReward(
    guildId: string,
    inviteThreshold: number,
    rewardName: string,
    message: string
  ) {
    await RewardModel.create({
      guildId,
      rewardName,
      inviteThreshold,
      rewardType: "message",
      message,
    });
  }

  static async addMessageStoreReward(
    guildId: string,
    inviteThreshold: number,
    rewardName: string,
    messageStore: string[]
  ) {
    await RewardModel.create({
      guildId,
      rewardName,
      inviteThreshold,
      rewardType: "messageStore",
      messageStore,
    });
  }

  static async doesRewardExist(guildId: string, rewardName: string) {
    return await RewardModel.exists({ guildId, rewardName });
  }

  static async removeReward(guildId: string, rewardName: string) {
    await RewardModel.deleteOne({ guildId, rewardName });
  }

  static async getRewards(guildId: string) {
    return await RewardModel.find({ guildId });
  }

  static async setAsClaimed(
    guildId: string,
    rewardName: string,
    userId: string
  ) {
    await RewardModel.updateOne(
      { guildId, rewardName },
      { $push: { claimedBy: userId } }
    );
  }

  static async unclaimReward(
    guildId: string,
    rewardName: string,
    userId: string
  ) {
    await RewardModel.updateOne(
      { guildId, rewardName },
      { $pull: { claimedBy: userId } }
    );
  }

  static async shiftFirstMessageFromStore(guildId: string, rewardName: string) {
    const reward = await RewardModel.findOne({ guildId, rewardName });
    if (!reward || !reward.messageStore) return null;
    const message = reward.messageStore.shift();

    await reward.save();

    return message;
  }

  static async fillStore(
    guildId: string,
    rewardName: string,
    messages: string[]
  ) {
    await RewardModel.updateOne(
      { guildId, rewardName },
      { $push: { messageStore: { $each: messages } } }
    );
  }

  static async isStore(guildId: string, rewardName: string) {
    const reward = await RewardModel.findOne({ guildId, rewardName });
    return reward?.rewardType === "messageStore";
  }

  static async getStoreSize(guildId: string, rewardName: string) {
    const reward = await RewardModel.findOne({ guildId, rewardName });
    return reward?.messageStore?.length ?? 0;
  }
}
