import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { Embeds } from "../../utils/embeds/embeds.js";
import { ApplicationCommandOptionType } from "discord.js";
import setChannel from "./func/setChannel.js";
import removeChannel from "./func/removeChannel.js";
import setMessage from "./func/setMessage.js";
import removeMessage from "./func/removeMessage.js";
import viewMessage from "./func/viewMessage.js";

export const data: CommandData = {
  name: "welcome",
  description: "Configure the welcome message and channel for the server",
  options: [
    {
      name: "channel",
      description: "Configure where to send the welcome message",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set",
          description: "Set the welcome channel in the server",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to send the welcome message in",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
        {
          name: "disable",
          description: "Remove the welcome channel",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    },
    {
      name: "message",
      description: "Configure the welcome message content",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "set-server",
          description: "Set the welcome message for the server channel",
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
          description: "Remove the server welcome message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-server",
          description: "View the server welcome message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-dm",
          description: "Set the welcome message for DMs",
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
          description: "Remove the DM welcome message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-dm",
          description: "View the DM welcome message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "set-vanity",
          description: "Set the vanity welcome message",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "message",
              description: "The vanity message to send in the server channel",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "remove-vanity",
          description: "Remove the vanity welcome message",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "view-vanity",
          description: "View the vanity welcome message",
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
      await setChannel(interaction, "welcome");
      break;
    case "channel disable":
      await removeChannel(interaction, "welcome");
      break;
    case "message set-server":
      await setMessage(interaction, "welcome", "server");
      break;
    case "message set-dm":
      await setMessage(interaction, "welcome", "dm");
      break;
    case "message remove-server":
      await removeMessage(interaction, "welcome", "server");
      break;
    case "message remove-dm":
      await removeMessage(interaction, "welcome", "dm");
      break;
    case "message view-server":
      await viewMessage(interaction, "welcome", "server");
      break;
    case "message view-dm":
      await viewMessage(interaction, "welcome", "dm");
      break;
    case "message set-vanity":
      await setMessage(interaction, "welcome", "vanity");
      break;
    case "message remove-vanity":
      await removeMessage(interaction, "welcome", "vanity");
      break;
    case "message view-vanity":
      await viewMessage(interaction, "welcome", "vanity");
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
  devOnly: true,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
