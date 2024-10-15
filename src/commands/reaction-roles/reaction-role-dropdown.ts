import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { devMode } from "../../index.js";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  Role,
  PartialGroupDMChannel,
} from "discord.js";

export const data: CommandData = {
  name: "reaction-role-dropdown",
  description: "Create a reaction role dropdown!",
  options: [
    {
      name: "role-1",
      description: "The role to assign when selected.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: "role-1-text",
      description: "The text to display for role 1.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "role-2",
      description: "The role to assign when selected.",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
    {
      name: "role-2-text",
      description: "The text to display for role 2.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "role-3",
      description: "The role to assign when selected.",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
    {
      name: "role-3-text",
      description: "The text to display for role 3.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "role-4",
      description: "The role to assign when selected.",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
    {
      name: "role-4-text",
      description: "The text to display for role 4.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "role-5",
      description: "The role to assign when selected.",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
    {
      name: "role-5-text",
      description: "The text to display for role 5.",
      type: ApplicationCommandOptionType.String,
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

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("reaction-role-dropdown")
    .setPlaceholder("Select your roles")
    .setMinValues(1)
    .setMaxValues(roles.length);

  roles.forEach((role, index) => {
    const roleText =
      interaction.options.getString(`role-${index + 1}-text`) || role.name;

    const option = new StringSelectMenuOptionBuilder()
      .setLabel(roleText)
      .setValue(role.id);

    selectMenu.addOptions(option);
  });

  const actionRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  await interaction.channel.send({
    content: "Select your roles from the dropdown below:",
    components: [actionRow],
  });

  await interaction.followUp({
    content: "Reaction role dropdown has been created!",
    ephemeral: true,
  });
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
};
