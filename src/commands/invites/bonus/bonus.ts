import type {
  CommandData,
  CommandOptions,
  SlashCommandProps,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { devMode } from "../../../index.js";
import addFakeInvites from "./add.js";
import removeFakeInvites from "./remove.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
import { Helpers } from "../../../utils/helpers/helpers.js";

export const data: CommandData = {
  name: "bonus",
  description: "Manage bonus invites",
  options: [
    {
      name: "invites",
      description: "Manage bonus invites",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "add",
          description: "Add fake invites to a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "The user",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "count",
              description: "The amount of invites to add",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
          ],
        },
        {
          name: "remove",
          description: "Remove fake invites from a user",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "user",
              description: "The user",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "count",
              description: "The amount of invites to remove",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            },
          ],
        },
      ]
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const subcommandGroup = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand(false);

  const command = `${subcommandGroup ? `${subcommandGroup} ` : ""}${
    subcommand ? subcommand : ""
  }`;

  try {
    switch (command) {
      case "invites add":
        await addFakeInvites(interaction);
        break;
      case "invites remove":
        await removeFakeInvites(interaction);
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
  } catch (error: unknown) {
    cs.error(
      "An error occurred while executing the bonus-invites command: " + error
    );

    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
