import WelcomerModel from "../models/welcomer.js";
export class welcomer {
    // Setters and removers for Server
    static async setWelcomeChannel(guildId, channelId) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { "server.welcomeChannelId": channelId }, { upsert: true }).exec();
    }
    static removeEmbed(guildId, type, location) {
        return WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.${type}Embed`]: null }).exec();
    }
    static async getEmbed(guildId, type, location) {
        const doc = await WelcomerModel.findOne({ guildId })
            .select(`${location}.${type}Embed`)
            .exec();
        return doc ? doc[location][`${type}Embed`] : null;
    }
    static async removeWelcomeChannel(guildId) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { "server.welcomeChannelId": null }).exec();
    }
    static async setWelcomeMessage(guildId, message, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.welcomeMessage`]: message }, { upsert: true }).exec();
    }
    static async removeWelcomeMessage(guildId, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.welcomeMessage`]: null }).exec();
    }
    static async setWelcomeEmbed(guildId, embed, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.welcomeEmbed`]: embed.toJSON() }, { upsert: true }).exec();
    }
    static async removeWelcomeEmbed(guildId, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.welcomeEmbed`]: null }).exec();
    }
    static async setFarewellChannel(guildId, channelId) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { "server.farewellChannelId": channelId }, { upsert: true }).exec();
    }
    static async removeFarewellChannel(guildId) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { "server.farewellChannelId": null }).exec();
    }
    static async setFarewellMessage(guildId, message, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.farewellMessage`]: message }, { upsert: true }).exec();
    }
    static async removeFarewellMessage(guildId, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.farewellMessage`]: null }).exec();
    }
    static async setFarewellEmbed(guildId, embed, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.farewellEmbed`]: embed.toJSON() }, { upsert: true }).exec();
    }
    static async removeFarewellEmbed(guildId, location) {
        await WelcomerModel.findOneAndUpdate({ guildId }, { [`${location}.farewellEmbed`]: null }).exec();
    }
    static async getWelcomeMessage(guildId, location) {
        const doc = await WelcomerModel.findOne({ guildId })
            .select(`${location}.welcomeMessage`)
            .exec();
        return doc ? doc[location].welcomeMessage : null;
    }
    static async getFarewellMessage(guildId, location) {
        const doc = await WelcomerModel.findOne({ guildId })
            .select(location + ".farewellMessage")
            .exec();
        console.log(doc);
        return doc ? doc[location].farewellMessage : null;
    }
    static async getWelcomerSettings(guildId) {
        return await WelcomerModel.findOne({ guildId });
    }
}
