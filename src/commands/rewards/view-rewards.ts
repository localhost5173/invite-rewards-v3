import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getGuildRewards } from "../../firebase/rewards.js"; // Adjust the path as needed
import { viewRewardsEmbed } from "../../utils/embeds/rewards.js";
import { devMode } from "../../index.js";

export default async function (interaction : ChatInputCommandInteraction) {
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  // Fetch the rewards using the new database logic function
  const guildRewards = await getGuildRewards(guildId);

  if (!guildRewards) {
    return interaction.followUp({
      content: "No rewards found for this server.",
      ephemeral: true,
    });
  }

  // Create the embed using the helper function
  const rewardsEmbed = viewRewardsEmbed(guildRewards);

  // Send the embed
  return interaction.followUp({ embeds: [rewardsEmbed] });
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ViewAuditLog"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};