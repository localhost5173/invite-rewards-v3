import { ChannelType, Guild, TextChannel } from "discord.js";
import { devMode } from "../../index.js";
import { botJoinEmbed } from "../../utils/embeds/system.js";

export default async function (guild: Guild) {
  try {
    // Fetch all channels in the guild
    const channels = await guild.channels.fetch();

    // Find the first text channel
    const firstTextChannel = channels
      .filter((channel): channel is TextChannel => channel?.type === ChannelType.GuildText)
      .first();

    if (firstTextChannel) {
      // Send the introduction message
      await firstTextChannel.send({embeds: [botJoinEmbed()]})
      devMode ?? console.log(`Sent introduction message to ${firstTextChannel.name} in ${guild.name}`);
    } else {
      devMode ?? console.log(`No suitable text channel found in ${guild.name}`);
    }
  } catch (error) {
    console.error(`Failed to send introduction message in ${guild.name}:`, error);
  }
}