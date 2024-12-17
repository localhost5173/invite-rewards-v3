import { Guild } from "discord.js";
import GuildModel from "../models/guildModel.js";
import { cs } from "../../console/customConsole.js";

export class guilds {
  static async updateGuild(guild: Guild) {
    await GuildModel.updateOne(
      { guildId: guild.id },
      {
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.memberCount,
        joinedAt: guild.joinedAt,
        leftAt: null,
      },
      { upsert: true }
    );
  }

  static async setGuildLeft(guild: Guild) {
    await GuildModel.updateOne({ guildId: guild.id }, { leftAt: new Date() });
  }
}
