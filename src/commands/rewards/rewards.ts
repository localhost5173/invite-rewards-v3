import type {
  CommandData,
  CommandOptions,
  SlashCommandProps,
} from "commandkit";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { devMode } from "../../index.js";
import addInviteReward from "./add-invite-reward.js";
import removeReward from "./remove-reward.js";
import viewRewards from "./view-rewards.js";

export const data: CommandData = {
  name: "rewards",
  description: "Manage invite-based rewards",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "add-reward",
      description: "Creates a reward for a specific invite count.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "type",
          description: "The type of reward",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {
              name: "Role",
              value: "role",
            },
            {
              name: "Link",
              value: "link",
            },
            {
              name: "Link Bank",
              value: "link-bank",
            },
          ],
        },
        {
          name: "count",
          description: "How many invites are required for the reward",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "removable",
          description:
            "If the reward is removed when the user has less invites than required for the reward. ",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "role",
          description: "The role to assign as a reward",
          type: ApplicationCommandOptionType.Role,
          required: false,
        },
        {
          name: "link",
          description: "The link to send to the user",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "link-bank",
          description: "The text file containing links to send to the user",
          type: ApplicationCommandOptionType.Attachment,
          required: false,
        },
      ],
    },
    {
      name: "remove-reward",
      description: "Delete a reward from the server by its invite threshold.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          type: ApplicationCommandOptionType.Integer,
          name: "count",
          description: "The invite amount for the reward",
          required: true,
        },
      ],
    },
    {
      name: "view",
      description: "View all rewards for the server.",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const subcommand = interaction.options.getSubcommand(false);

  switch (subcommand) {
    case "add-reward":
      await addInviteReward(interaction);
      break;
    case "remove-reward":
      await removeReward(interaction);
      break;
    case "view":
      await viewRewards(interaction);
      break;
    default:
      await interaction.reply({
        content: "Invalid subcommand",
        ephemeral: true,
      });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageGuild"],
  deleted: false,
};
