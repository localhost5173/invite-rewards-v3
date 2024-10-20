import { ChatInputCommandInteraction } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const role = interaction.options.getRole("role");

    await interaction.deferReply({ ephemeral: true });

    // Check if the role exists
    if (!role) {
      return interaction.followUp({
        embeds: [await Embeds.roles.roleNotFoundError(interaction.guildId!)],
        ephemeral: true,
      });
    }

    // Check if the role is managed
    if (role.managed) {
      return interaction.followUp({
        embeds: [
          await Embeds.roles.managedRoleAssignError(
            interaction.guildId!,
            role.id
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
          await Embeds.roles.hierarchyRoleAssignError(
            interaction.guildId!,
            role.id
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the role is already auto-assigned
    const autoroles = await db.autoRoles.getRoles(interaction.guildId!);
    if (autoroles.includes(role.id)) {
      return interaction.followUp({
        embeds: [
          await Embeds.autoRoles.add.alreadyAutoRoleWarning(
            interaction.guildId!,
            role.id
          ),
        ],
        ephemeral: true,
      });
    }

    // Add the role to auto-assign
    await db.autoRoles.addRole(interaction.guildId!, role.id);
    return await interaction.followUp({
      embeds: [
        await Embeds.autoRoles.add.success(interaction.guildId!, role.id),
      ],
    });
  } catch (error: unknown) {
    cs.error(error as string);

    // Try to send an error message to the user
    try {
      const guildId = interaction.guildId!;
      await interaction.followUp({
        embeds: [await Embeds.system.errorWhileExecutingCommand(guildId)],
        ephemeral: true,
      });
    } catch (error: unknown) {
      cs.error("Failed to send error message in auto-roles command" + error);
    }
  }
}
