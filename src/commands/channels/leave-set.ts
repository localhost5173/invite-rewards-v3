import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  ApplicationCommandOptionType,
  TextChannel,
  EmbedBuilder,
  GuildChannel,
  ChannelType,
  ChatInputCommandInteraction,
} from "discord.js";
import { setGoodbyeChannel } from "../../firebase/channels.js";
import { devMode } from "../../index.js";
import {
  welcomeLeaveChannelErrorEmbed,
  welcomeLeaveChannelSuccessEmbed,
} from "../../utils/embeds/channels.js";

export default async function (interaction : ChatInputCommandInteraction) {
  try {
    const targetChannel = interaction.options.getChannel(
      "channel",
      true
    ) as GuildChannel;
    const customMessage =
      interaction.options.getString("message") ||
      "Bye {username}! {username} was invited by {inviter-tag} who now has {inviter-count} invites!";

    if (!targetChannel) {
      const embed = welcomeLeaveChannelErrorEmbed(
        "Please provide a valid channel."
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (targetChannel.type !== ChannelType.GuildText) {
      const embed = welcomeLeaveChannelErrorEmbed(
        "Please provide a text channel."
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = welcomeLeaveChannelErrorEmbed(
        "This command can only be used in a guild."
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    await setGoodbyeChannel(guildId, targetChannel.id, customMessage);

    const embed = welcomeLeaveChannelSuccessEmbed(
      `Leave channel has been set to <#${targetChannel.id}>`
    );
    interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error while running set-leave-channel command", error);
    const embed = welcomeLeaveChannelErrorEmbed(
      "Error while setting the leave channel."
    );
    interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageChannels"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};