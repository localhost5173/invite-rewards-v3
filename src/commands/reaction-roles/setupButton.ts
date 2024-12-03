import {
  ActionRowBuilder,
  APIRole,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PartialGroupDMChannel,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import { Embeds } from "../../utils/embeds/embeds.js";

type RoleArrayValue = Role | APIRole;

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.channel) {
    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(interaction.guildId!, "general.serverCommand"),
      ],
      ephemeral: true,
    });
    return;
  }

  if (interaction.channel instanceof PartialGroupDMChannel) {
    return interaction.reply({
      embeds: [
        await Embeds.createEmbed(interaction.guildId!, "general.noGroupDm"),
      ],
      ephemeral: true,
    });
  }

  await interaction.deferReply({
    ephemeral: true,
  });

  const roles: RoleArrayValue[] = [];
  for (let i = 1; i <= 5; i++) {
    const role = interaction.options.getRole(`role-${i}`, false);
    if (role) {
      roles.push(role);
    }
  }

  if (!roles.length) {
    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          interaction.guildId!,
          "reactionRoles.noRolesProvided"
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  // Check if the bot has the necessary permissions and the role is not managed
  for (const role of roles) {
    // Check if the role is managed
    if (role.managed) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.managedRoleAssignError",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the bot has the necessary permissions
    if (
      !interaction.guild!.members.me ||
      interaction.guild!.members.me.roles.highest.position <= role.position
    ) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.hierarchyRoleAssignError",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    if (
      !interaction.guild!.members.me.permissions.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.noManageRolesPermissionError"
          ),
        ],
        ephemeral: true,
      });
    }
  }

  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  roles.forEach((role, index) => {
    const roleText =
      interaction.options.getString(`role-${index + 1}-text`) || role.name;
    const roleStyle =
      interaction.options.getString(`role-${index + 1}-style`) || "PRIMARY";

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
    embeds: [
      await Embeds.createEmbed(interaction.guildId!, "reactionRoles.success"),
    ],
    ephemeral: true,
  });
}