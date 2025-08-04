import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import setChannel from "./func/setChannel.js";
import removeChannel from "./func/removeChannel.js";
import setMessage from "./func/setMessage.js";
import removeMessage from "./func/removeMessage.js";
import viewMessage from "./func/viewMessage.js";
import setEmbed from "./func/setEmbed.js";
import removeEmbed from "./func/removeEmbed.js";
import viewEmbed from "./func/viewEmbed.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "farewell",
  description: "Configure the farewell message and channel for the server",
  options: [
    {
      name: "channel",
      description: "Configure where to send the farewell message",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set",
          description: "Set the farewell channel in the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to send the farewell message in",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
        {
          name: "disable",
          description: "Remove the farewell channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "message",
      description: "Configure the farewell message content",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set-server",
          description: "Set the farewell message for the server channel",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "message",
              description: "The message to send in the server channel",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "remove-server",
          description: "Remove the server farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-server",
          description: "View the server farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-dm",
          description: "Set the farewell message for DMs",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "message",
              description: "The message to send in a DM",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "remove-dm",
          description: "Remove the DM farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-dm",
          description: "View the DM farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-vanity",
          description: "Set the farewell message for vanity URLs",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "message",
              description: "The message to send in a vanity URL",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "remove-vanity",
          description: "Remove the vanity farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-vanity",
          description: "View the vanity farewell message",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "embed",
      description: "Configure the farewell message embed",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set-server",
          description: "Set the farewell message embed for the server channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "remove-server",
          description: "Remove the server farewell message embed",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-server",
          description: "View the server farewell message embed",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-dm",
          description: "Set the farewell message embed for DMs",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "remove-dm",
          description: "Remove the DM farewell message embed",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-dm",
          description: "View the DM farewell message embed",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-vanity",
          description: "Set the farewell message embed for vanity URLs",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "remove-vanity",
          description: "Remove the vanity farewell message embed",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-vanity",
          description: "View the vanity farewell message embed",
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
    case "channel set":
      await setChannel(interaction, "farewell");
      break;
    case "channel disable":
      await removeChannel(interaction, "farewell");
      break;
    case "message set-server":
      await setMessage(interaction, "farewell", "server");
      break;
    case "message set-dm":
      await setMessage(interaction, "farewell", "dm");
      break;
    case "message remove-server":
      await removeMessage(interaction, "farewell", "server");
      break;
    case "message remove-dm":
      await removeMessage(interaction, "farewell", "dm");
      break;
    case "message view-server":
      await viewMessage(interaction, "farewell", "server");
      break;
    case "message view-dm":
      await viewMessage(interaction, "farewell", "dm");
      break;
    case "message set-vanity":
      await setMessage(interaction, "farewell", "vanity");
      break;
    case "message remove-vanity":
      await removeMessage(interaction, "farewell", "vanity");
      break;
    case "message view-vanity":
      await viewMessage(interaction, "farewell", "vanity");
      break;
    case "embed set-server":
      await setEmbed(interaction, "farewell", "server");
      break;
    case "embed set-dm":
      await setEmbed(interaction, "farewell", "dm");
      break;
    case "embed remove-server":
      await removeEmbed(interaction, "farewell", "server");
      break;
    case "embed remove-dm":
      await removeEmbed(interaction, "farewell", "dm");
      break;
    case "embed view-server":
      await viewEmbed(interaction, "farewell", "server");
      break;
    case "embed view-dm":
      await viewEmbed(interaction, "farewell", "dm");
      break;
    case "embed set-vanity":
      await setEmbed(interaction, "farewell", "vanity");
      break;
    case "embed remove-vanity":
      await removeEmbed(interaction, "farewell", "vanity");
      break;
    case "embed view-vanity":
      await viewEmbed(interaction, "farewell", "vanity");
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
  devOnly: false,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};