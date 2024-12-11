import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import viewLeaderboard from "./view.js";
import createSmart from "./createSmart.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "leaderboard",
  description: "View the leaderboard",
  options: [
    {
      name: "daily",
      description: "View the daily leaderboard",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "smart",
          description: "Enable smart leaderboard",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "weekly",
      description: "View the weekly leaderboard",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "smart",
          description: "Enable smart leaderboard",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "monthly",
      description: "View the monthly leaderboard",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "smart",
          description: "Enable smart leaderboard",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: "all-time",
      description: "View the all-time leaderboard",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "smart",
          description: "Enable smart leaderboard",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  if (!interaction.guild) return;

  let subcommand = interaction.options.getSubcommand();
  const smart = interaction.options.getBoolean("smart", false);

  if (smart) {
    subcommand += "-smart";
  }

  switch (subcommand) {
    case "daily":
      await viewLeaderboard(interaction, "daily");
      break;
    case "weekly":
      await viewLeaderboard(interaction, "weekly");
      break;
    case "monthly":
      await viewLeaderboard(interaction, "monthly");
      break;
    case "all-time":
      await viewLeaderboard(interaction, "alltime");
      break;
    case "daily-smart":
      await createSmart(interaction, "daily");
      break;
    case "weekly-smart":
      await createSmart(interaction, "weekly");
      break;
    case "monthly-smart":
      await createSmart(interaction, "monthly");
      break;
    case "all-time-smart":
      await createSmart(interaction, "alltime");
      break;
    default:
      return;
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageMessages"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};