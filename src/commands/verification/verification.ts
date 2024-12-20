import type {
  CommandData,
  CommandOptions,
  SlashCommandProps,
} from "commandkit";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { devMode } from "../../bot.js";
import setupVerification from "./setup.js";
import disableVerification from "./disable.js";
import { Embeds } from "../../utils/embeds/embeds.js";

export const data: CommandData = {
  name: "verification",
  description: "Manage server verification",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "setup",
      description: "Set up the verification system for the server.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "simple",
          description: "Creates a button-based verification system",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to use for verification",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "role",
              description: "The role to give to verified users",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
        {
          name: "question",
          description:
            "Creates a verification system with a question that users have to answer",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to use for verification",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "role",
              description: "The role to give to verified users",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "question",
              description: "The question to use for verification",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "answer",
              description: "The answer to use for verification",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "pin",
          description:
            "Creates a verification system with a random pin that a user must enter to get verified.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to use for verification",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "role",
              description: "The role to give to verified users",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "disable",
      description: "Disables the verification system for the server.",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const subcommandGroup = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand(false);

  const command = `${subcommandGroup ? `${subcommandGroup} ` : ""}${
    subcommand ? subcommand : ""
  }`;

  switch (command) {
    case "setup simple":
      await setupVerification(interaction, "simple");
      break;
    case "setup question":
      await setupVerification(interaction, "question");
      break;
    case "setup pin":
      await setupVerification(interaction, "pin");
      break;
    case "disable":
      await disableVerification(interaction);
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
  botPermissions: ["SendMessages", "ManageRoles", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};