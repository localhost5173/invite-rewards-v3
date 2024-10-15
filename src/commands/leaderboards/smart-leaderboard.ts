import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import {
  createSmartLeaderboard,
  getLeaderboardByType,
  getSmartLeaderboards,
} from "../../firebase/leaderboards.ts"; // Assume this utility function fetches the leaderboard by type
import { devMode } from "../../index.ts";
import { viewLeaderboardEmbed } from "../../utils/embeds/leaderboards.ts";
import { hasVoted } from "../../utils/topgg/voteLock.ts";
import { voteLockedCommandEmbed } from "../../utils/embeds/system.ts";

// Define the command data
export const data: CommandData = {
  name: "smart-leaderboard",
  description:
    "Displays an auto-updating leaderboard based on the selected type.",
  options: [
    {
      name: "type",
      description: "The type of leaderboard to display",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "All Time", value: "allTime" },
        { name: "Monthly", value: "monthly" },
        { name: "Weekly", value: "weekly" },
        { name: "Daily", value: "daily" },
      ],
    },
  ],
};

// Handle the command logic
export async function run({ interaction, client }: SlashCommandProps) {
  if (!(await hasVoted(interaction.user.id))) {
    return interaction.reply({
      embeds: [voteLockedCommandEmbed()],
      ephemeral: true,
    });
  }
  const guildId = interaction.guild?.id;
  const leaderboardType = interaction.options.getString("type");
  devMode ?? console.log("Leaderboard type: ", leaderboardType);
  const channel = interaction.channel;

  await interaction.deferReply(); // Defer the reply if the leaderboard fetching takes some time

  if (!guildId) {
    return interaction.followUp("This command can only be used in a guild.");
  }

  if (!leaderboardType) {
    return interaction.followUp("Please provide a valid leaderboard type.");
  }

  if (
    leaderboardType !== "allTime" &&
    leaderboardType !== "monthly" &&
    leaderboardType !== "weekly" &&
    leaderboardType !== "daily"
  ) {
    return interaction.followUp("Please provide a valid leaderboard type.");
  }

  if (!channel) {
    return interaction.followUp("Channel not found.");
  }

  try {
    // Fetch the appropriate leaderboard based on the selected type
    const leaderboards = await getSmartLeaderboards(guildId);
    devMode ?? console.log("Leaderboards: ", leaderboards);

    if (leaderboards.length >= 4) {
      return interaction.followUp(
        "You may only have up to 4 active smart leaderboards. Please remove some leaderboards before adding new ones."
      );
    }
    const leaderboard = await getLeaderboardByType(guildId, leaderboardType);

    // Format the leaderboard entries
    const embed = await viewLeaderboardEmbed(
      client,
      leaderboard,
      leaderboardType
    );

    // Send the embedded leaderboard
    const message = await interaction.followUp({ embeds: [embed] });

    await createSmartLeaderboard(
      guildId,
      channel.id,
      message.id,
      leaderboardType
    ); // Store the message ID for future reference
    return;
  } catch (error) {
    console.error(`Failed to fetch leaderboard:`, error);
    return interaction.followUp(
      "An error occurred while fetching the leaderboard."
    );
  }
}

// Helper function to capitalize the first letter of a string
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageMessages"],
  deleted: false,
};
