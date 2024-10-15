import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { devMode } from "../../index.js";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  PartialGroupDMChannel,
  Role,
} from "discord.js";

export const data: CommandData = {
  name: "reaction-role-button",
  description: "Create a reaction role row with buttons!",
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
};

export async function run({ interaction }: SlashCommandProps) {
  if (!interaction.guild) return;
  if (!interaction.channel) return;

  if (interaction.channel instanceof PartialGroupDMChannel) {
    return interaction.reply({
      content: "This command is not available in group DMs.",
      ephemeral: true,
    });
  }

  await interaction.deferReply({
    ephemeral: true,
  });

  const roles = interaction.options.data
    .map((option) => option.role)
    .filter((role): role is Role => role !== null && role !== undefined);

  if (!roles.length) return;

  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  roles.forEach((role, index) => {
    const roleText =
      interaction.options.getString(`role-${index + 1}-text`) || role.name;
    const roleStyle =
      interaction.options.getString(`role-${index + 1}-style`) || "PRIMARY";

    // Ensure the roleStyle is a valid ButtonStyle
    const validStyles = ["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"];
    let buttonStyle;

    switch (roleStyle.toUpperCase()) {
      case "PRIMARY":
        buttonStyle = ButtonStyle.Primary;
        break;
      case "SECONDARY":
        buttonStyle = ButtonStyle.Secondary;
        break;
      case "SUCCESS":
        buttonStyle = ButtonStyle.Success;
        break;
      case "DANGER":
        buttonStyle = ButtonStyle.Danger;
        break;
      default:
        buttonStyle = ButtonStyle.Primary;
        break;
    }

    const button = new ButtonBuilder()
      .setCustomId("role-" + role.id)
      .setLabel(roleText)
      .setStyle(buttonStyle);

    actionRow.addComponents(button);
  });

  await interaction.channel.send({
    components: [actionRow],
  });

  await interaction.followUp({
    content: "Reaction role buttons have been created!",
    ephemeral: true,
  });
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
};