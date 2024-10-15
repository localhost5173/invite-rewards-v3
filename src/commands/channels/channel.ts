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
import setWelcomeChannel from "./welcome-set.js";
import removeWelcomeChannel from "./welcome-remove.js";
import setLeaveChannel from "./leave-set.js";
import removeLeaveChannel from "./leave-remove.js";
import setInfoChannel from "./info-set.js";
import removeInfoChannel from "./info-remove.js";

export const data: CommandData = {
  name: "channel",
  description: "Manage channels",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "welcome",
      description: "Manage welcome channel settings",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set",
          description: "Set a welcome channel for your server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to send welcome messages",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "message",
              description: "The message to send when a user joins the server.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove the welcome channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "leave",
      description: "Manage leave channel settings",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set",
          description: "Set a leave channel for your server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to send leave messages",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
            {
              name: "message",
              description: "The message to send when a user leaves the server.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove the leave channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "info",
      description: "Manage info channel settings",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set",
          description: "Set an info channel for your server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to send info (system) messages",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove the info channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
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
    case "welcome set":
      await setWelcomeChannel(interaction);
      break;
    case "welcome remove":
      await removeWelcomeChannel(interaction);
      break;
    case "leave set":
      await setLeaveChannel(interaction);
      break;
    case "leave remove":
      await removeLeaveChannel(interaction);
      break;
    case "info set":
      await setInfoChannel(interaction);
      break;
    case "info remove":
      await removeInfoChannel(interaction);
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
  userPermissions: ["ManageChannels"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageGuild"],
  deleted: false,
};