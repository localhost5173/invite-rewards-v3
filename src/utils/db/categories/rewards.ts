import { RewardModel } from "../models/rewards";

export class rewards {
  static async addRoleReward(
    guildId: string,
    inviteThreshold: number,
    rewardName: string,
    roleId: string
  ) {
    await RewardModel.create({
      guildId,
      rewardName,
      inviteThreshold,
      rewardType: "role",
      roleId,
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
}
