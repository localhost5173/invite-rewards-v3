import type { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { EmbedBuilder } from "discord.js";
import { getBlacklist } from "../../firebase/leaderboards.js";
import { viewBlacklistEmbed } from "../../utils/embeds/leaderboards.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "view-blacklist",
  description: "View the current blacklist for users and roles.",
};

export async function run({ interaction }: SlashCommandProps) {
  const guildId = interaction.guild?.id;

  // Check if the command is being used in a guild
  if (!guildId) {
    return interaction.reply("This command can only be used in a guild.");
  }

  try {
    // Fetch the guild document from the database
    const blacklist = await getBlacklist(guildId);
    console.log("Blacklist : ", blacklist);

    // If the blacklist is empty
    if (!blacklist || (blacklist.user.length === 0 && blacklist.role.length === 0)) {
      return interaction.reply("There are no users or roles blacklisted in this guild.");
    }

    // Create the embed using the helper function
    const blacklistEmbed = viewBlacklistEmbed(blacklist);

    // Send the embed
    await interaction.reply({ embeds: [blacklistEmbed], ephemeral: true });
  } catch (error) {
    console.error("Failed to view blacklist:", error);
    await interaction.reply("An error occurred while fetching the blacklist.");
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};