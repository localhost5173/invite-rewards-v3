import { APIEmbed, EmbedBuilder } from "discord.js";
import WelcomerModel from "../models/welcomer";

export class welcomer {
  // Setters and removers for Server
  static async setWelcomeChannel(guildId: string, channelId: string) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { "server.welcomeChannelId": channelId },
      { upsert: true }
    ).exec();
  }

  static removeEmbed(
    guildId: string,
    type: "welcome" | "farewell",
    location: "server" | "dm" | "vanity"
  ) {
    return WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.${type}Embed`]: null }
    ).exec();
  }

  static async getEmbed(
    guildId: string,
    type: "welcome" | "farewell",
    location: "server" | "dm" | "vanity"
  ): Promise<APIEmbed | null> {
    const doc = await WelcomerModel.findOne({ guildId })
      .select(`${location}.${type}Embed`)
      .exec();

    return doc ? doc[location][`${type}Embed`] : null;
  }

  static async removeWelcomeChannel(guildId: string) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { "server.welcomeChannelId": null }
    ).exec();
  }

  static async setWelcomeMessage(
    guildId: string,
    message: string,
    location: "server" | "dm" | "vanity" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.welcomeMessage`]: message },
      { upsert: true }
    ).exec();
  }

  static async removeWelcomeMessage(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.welcomeMessage`]: null }
    ).exec();
  }

  static async setWelcomeEmbed(
    guildId: string,
    embed: EmbedBuilder,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.welcomeEmbed`]: embed.toJSON() },
      { upsert: true }
    ).exec();
  }

  static async removeWelcomeEmbed(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.welcomeEmbed`]: null }
    ).exec();
  }

  static async setFarewellChannel(guildId: string, channelId: string) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { "server.farewellChannelId": channelId },
      { upsert: true }
    ).exec();
  }

  static async removeFarewellChannel(guildId: string) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { "server.farewellChannelId": null }
    ).exec();
  }

  static async setFarewellMessage(
    guildId: string,
    message: string,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.farewellMessage`]: message },
      { upsert: true }
    ).exec();
  }

  static async removeFarewellMessage(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.farewellMessage`]: null }
    ).exec();
  }

  static async setFarewellEmbed(
    guildId: string,
    embed: EmbedBuilder,
    location: "server" | "dm" | "vanity"
  ) {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.farewellEmbed`]: embed.toJSON() },
      { upsert: true }
    ).exec();
  }

  static async removeFarewellEmbed(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ): Promise<void> {
    await WelcomerModel.findOneAndUpdate(
      { guildId },
      { [`${location}.farewellEmbed`]: null }
    ).exec();
  }

  static async getWelcomeMessage(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ) {
    const doc = await WelcomerModel.findOne({ guildId })
      .select(`${location}.welcomeMessage`)
      .exec();

    return doc ? doc[location].welcomeMessage : null;
  }

  static async getFarewellMessage(
    guildId: string,
    location: "server" | "dm" | "vanity"
  ) {
    const doc = await WelcomerModel.findOne({ guildId })
      .select(location + ".farewellMessage")
      .exec();

    console.log(doc);
    return doc ? doc[location].farewellMessage : null;
  }

  static async getWelcomerSettings(guildId: string) {
    return await WelcomerModel.findOne({ guildId });
  }
}
