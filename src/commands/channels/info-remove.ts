import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { removeInfoChannel } from "../../firebase/channels.js";
import { devMode } from "../../index.js";
import {
  welcomeLeaveChannelErrorEmbed,
  welcomeLeaveChannelSuccessEmbed,
} from "../../utils/embeds/channels.js";
import { ChatInputCommandInteraction } from "discord.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = welcomeLeaveChannelErrorEmbed(
        "This command can only be used in a guild."
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    await removeInfoChannel(guildId);

    const embed = welcomeLeaveChannelSuccessEmbed(
      "Welcome channel has been removed."
    );
    interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error while running set-welcome-channel command", error);
    const embed = welcomeLeaveChannelErrorEmbed(
      "Error while removing the welcome channel."
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