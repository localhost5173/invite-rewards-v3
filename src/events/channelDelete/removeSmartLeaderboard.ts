import {
  Channel,
  ChannelType,
  GuildChannel,
  PartialGroupDMChannel,
} from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function (channel: Channel) {
  cs.dev("channelDelete event triggered.");
  try {
    if (
      !channel ||
      channel.type === ChannelType.DM ||
      !(channel instanceof GuildChannel) ||
      channel instanceof PartialGroupDMChannel
    )
      return;

    cs.dev("Deleting smart leaderboard upon channelDelete.");
    const guildId = channel.guild.id;
    const channelId = channel.id;

    await db.leaderboards.deleteSmartByChannelId(guildId, channelId);
  } catch (error) {
    console.error(
      "Error while deleting smart leaderboard upon messageDelete: " + error
    );
  }
}
