import GiveawayModel from "../models/giveaway";

export class giveaways {
  static async createGiveaway({
    guildId,
    channelId,
    messageId,
    prize,
    description,
    hostId,
    endTime,
    numberOfWinners,
    inviteRequirement,
    rewardRoleId,
  }: {
    guildId: string;
    channelId: string;
    messageId: string;
    prize: string;
    description: string;
    hostId: string;
    endTime: Date;
    numberOfWinners: number;
    inviteRequirement?: number;
    rewardRoleId?: string;
  }) {
    const giveaway = new GiveawayModel({
      guildId,
      channelId,
      messageId,
      prize,
      description,
      hostId,
      endTime,
      numberOfWinners,
      inviteRequirement,
      rewardRoleId,
    });

    await giveaway.save();
    return giveaway.giveawayId;
  }

  static async getGiveaway(guildId: string, giveawayId: number) {
    return GiveawayModel.findOne({ guildId, giveawayId });
  }

  static async setAsEnded(guildId: string, giveawayId: number) {
    return GiveawayModel.findOneAndUpdate(
      { guildId, giveawayId },
      { ended: true }
    );
  }

  static async enterGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    return GiveawayModel.findOneAndUpdate(
      { guildId, giveawayId },
      { $push: { entries: userId } }
    );
  }

  static async leaveGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    return GiveawayModel.findOneAndUpdate(
      { guildId, giveawayId },
      { $pull: { entries: userId } }
    );
  }

  static async getGiveawaysToEnd() {
    return GiveawayModel.find({
      ended: false,
      endTime: { $lte: new Date() },
    });
  }

  static async setWinners(guildId: string, giveawayId: number, winners: string[]) {
    return GiveawayModel.findOneAndUpdate(
      { guildId, giveawayId },
      { winners }
    );
  }

  static isEnded(guildId: string, giveawayId: number) {
    return GiveawayModel.findOne({ guildId, giveawayId, ended: true });
  }
}
