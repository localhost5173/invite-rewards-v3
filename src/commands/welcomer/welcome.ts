import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { Embeds } from "../../utils/embeds/embeds.js";
import { ApplicationCommandOptionType } from "discord.js";
import setWelcomeChannel from "./welcome/setWelcomeChannel.js";
import removeWelcomeChannel from "./welcome/removeWelcomeChannel.js";
import setWelcomeMessage from "./welcome/setWelcomeMessage.js";
import removeWelcomeMessage from "./welcome/removeWelcomeMessage.js";
import viewWelcomeMessage from "./welcome/viewWelcomeMessage.js";

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
      await setWelcomeChannel(interaction);
      break;
    case "channel disable":
      await removeWelcomeChannel(interaction);
      break;
    case "message set-server":
      await setWelcomeMessage(interaction, "server");
      break;
    case "message set-dm":
      await setWelcomeMessage(interaction, "dm");
      break;
    case "message remove-server":
      await removeWelcomeMessage(interaction, "server");
      break;
    case "message remove-dm":
      await removeWelcomeMessage(interaction, "dm");
      break;
    case "message view-server":
      await viewWelcomeMessage(interaction, "server");
      break;
    case "message view-dm":
      await viewWelcomeMessage(interaction, "dm");
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
