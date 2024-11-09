import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import getLeaderboard from "./get";

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

  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "daily":
      await getLeaderboard(interaction, "daily");
      break;
    case "weekly":
      await getLeaderboard(interaction, "weekly");
      break;
    case "monthly":
      await getLeaderboard(interaction, "monthly");
      break;
    case "all-time":
      await getLeaderboard(interaction, "alltime");
      break;
    default:
      return;
  }
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
