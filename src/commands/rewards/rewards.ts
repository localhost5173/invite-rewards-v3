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
import addInviteReward from "./add.js";
import removeReward from "./remove.js";
import viewRewards from "./view.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import fill from "./fill.js";

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
          name: "name",
          description: "The name of the reward",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
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
              name: "Message",
              value: "message",
            },
            {
              name: "Message Store",
              value: "messageStore",
            },
          ],
        },
        {
          name: "threshold",
          description: "The invite threshold to assign the reward",
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: "role",
          description: "The role to assign as a reward (Only for role rewards)",
          type: ApplicationCommandOptionType.Role,
          required: false,
        },
        {
          name: "removable",
          description: "Whether the role reward is removable",
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
        {
          name: "store",
          description:
            "A file with unique messages to assign as rewards (Only for message store rewards)",
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
          type: ApplicationCommandOptionType.String,
          name: "name",
          description: "The name of the reward to remove",
          required: true,
        },
      ],
    },
    {
      name: "view",
      description: "View all rewards for the server.",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "fill-store",
      description: "Fill the message store with messages from a file.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "The name of the message store",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "store",
          description: "The file with messages to fill the store",
          type: ApplicationCommandOptionType.Attachment,
          required: true,
        },
      ],
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
    case "fill-store":
      await fill(interaction);
      break;
    default:
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "general.invalidSubcommand"
          ),
        ],
        ephemeral: true,
      });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
