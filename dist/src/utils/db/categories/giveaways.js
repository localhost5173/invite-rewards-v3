import GiveawayModel from "../models/giveaway.js";
export class giveaways {
    static async createGiveaway({ guildId, channelId, messageId, prize, description, hostId, endTime, numberOfWinners, inviteRequirement, rewardRoleId, }) {
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
    static async getGiveaway(guildId, giveawayId) {
        return GiveawayModel.findOne({ guildId, giveawayId });
    }
    static async setAsEnded(guildId, giveawayId) {
        return GiveawayModel.findOneAndUpdate({ guildId, giveawayId }, { ended: true });
    }
    static async enterGiveaway(guildId, giveawayId, userId) {
        return GiveawayModel.findOneAndUpdate({ guildId, giveawayId }, { $push: { entries: userId } });
    }
    static async leaveGiveaway(guildId, giveawayId, userId) {
        return GiveawayModel.findOneAndUpdate({ guildId, giveawayId }, { $pull: { entries: userId } });
    }
    static async getGiveawaysToEnd() {
        return GiveawayModel.find({
            ended: false,
            endTime: { $lte: new Date() },
        });
    }
    static async setWinners(guildId, giveawayId, winners) {
        return GiveawayModel.findOneAndUpdate({ guildId, giveawayId }, { winners });
    }
    static isEnded(guildId, giveawayId) {
        return GiveawayModel.findOne({ guildId, giveawayId, ended: true });
    }
    static getGuildGiveaways(guildId) {
        return GiveawayModel.find({ guildId });
    }
}
