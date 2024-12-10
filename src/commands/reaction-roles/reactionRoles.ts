import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import setupButton from "./setupButton.js";
import { devMode } from "../../bot.js";

export const data: CommandData = {
  name: "reaction-roles",
  description: "Manage reaction roles",
  options: [
    {
      name: "button",
      description: "Manage button reaction roles",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Create button-based reaction role(s) (interactive)",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "role-1",
              description: "The role to assign when the button is clicked.",
              type: ApplicationCommandOptionType.Role,
              required: true,
            },
            {
              name: "role-1-text",
              description: "The text to display on the button for role 1.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "role-1-style",
              description: "The style of the button for role 1.",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Primary", value: "PRIMARY" },
                { name: "Secondary", value: "SECONDARY" },
                { name: "Success", value: "SUCCESS" },
                { name: "Danger", value: "DANGER" },
              ],
              required: false,
            },
            {
              name: "role-2",
              description: "The role to assign when the button is clicked.",
              type: ApplicationCommandOptionType.Role,
              required: false,
            },
            {
              name: "role-2-text",
              description: "The text to display on the button for role 2.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "role-2-style",
              description: "The style of the button for role 2.",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Primary", value: "PRIMARY" },
                { name: "Secondary", value: "SECONDARY" },
                { name: "Success", value: "SUCCESS" },
                { name: "Danger", value: "DANGER" },
              ],
              required: false,
            },
            {
              name: "role-3",
              description: "The role to assign when the button is clicked.",
              type: ApplicationCommandOptionType.Role,
              required: false,
            },
            {
              name: "role-3-text",
              description: "The text to display on the button for role 3.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "role-3-style",
              description: "The style of the button for role 3.",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Primary", value: "PRIMARY" },
                { name: "Secondary", value: "SECONDARY" },
                { name: "Success", value: "SUCCESS" },
                { name: "Danger", value: "DANGER" },
              ],
              required: false,
            },
            {
              name: "role-4",
              description: "The role to assign when the button is clicked.",
              type: ApplicationCommandOptionType.Role,
              required: false,
            },
            {
              name: "role-4-text",
              description: "The text to display on the button for role 4.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "role-4-style",
              description: "The style of the button for role 4.",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Primary", value: "PRIMARY" },
                { name: "Secondary", value: "SECONDARY" },
                { name: "Success", value: "SUCCESS" },
                { name: "Danger", value: "DANGER" },
              ],
              required: false,
            },
            {
              name: "role-5",
              description: "The role to assign when the button is clicked.",
              type: ApplicationCommandOptionType.Role,
              required: false,
            },
            {
              name: "role-5-text",
              description: "The text to display on the button for role 5.",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "role-5-style",
              description: "The style of the button for role 5.",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Primary", value: "PRIMARY" },
                { name: "Secondary", value: "SECONDARY" },
                { name: "Success", value: "SUCCESS" },
                { name: "Danger", value: "DANGER" },
              ],
              required: false,
            },
          ],
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
    case "button create":
      await setupButton(interaction);
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
  userPermissions: ["ManageRoles"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
