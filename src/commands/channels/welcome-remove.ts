import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { removeWelcomeChannel } from "../../firebase/channels.js";
import { welcomeLeaveChannelSuccessEmbed, welcomeLeaveChannelErrorEmbed } from "../../utils/embeds/channels.js";
import { devMode } from "../../index.js";
import { ChatInputCommandInteraction } from "discord.js";

export const data: CommandData = {
  name: "remove-welcome-channel",
  description: "Removes the welcome channel for your server",
  dm_permission: false,
};

export default async function (interaction : ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId;

    if (!guildId) {
      const embed = welcomeLeaveChannelErrorEmbed(
        "This command can only be used in a guild."
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    await removeWelcomeChannel(guildId);

    const embed = welcomeLeaveChannelSuccessEmbed("Welcome channel has been removed.");
    interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error while running remove-welcome-channel command", error);
    const embed = welcomeLeaveChannelErrorEmbed("Error while removing the welcome channel.");
    interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageChannels"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};