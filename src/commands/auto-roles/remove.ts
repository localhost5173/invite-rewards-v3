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

    // Check if the role is an auto role
    const autoroles = await db.autoRoles.getRoles(interaction.guildId!);
    if (!autoroles.includes(role.id)) {
      return interaction.followUp({
        embeds: [
          await Embeds.autoRoles.remove.notAutoRoleError(
            interaction.guildId!,
            role.id
          ),
        ],
        ephemeral: true,
      });
    }

    // Remove the role from auto-assign
    await db.autoRoles.removeRole(interaction.guildId!, role.id);

    return await interaction.followUp({
      embeds: [
        await Embeds.autoRoles.remove.success(interaction.guildId!, role.id),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while removing auto-role: " + error);

    // Try to send an error message to the user
    try {
      const guildId = interaction.guildId!;
      await interaction.followUp({
        embeds: [await Embeds.system.errorWhileExecutingCommand(guildId)],
        ephemeral: true,
      });
    } catch (error: unknown) {
      cs.error(
        "Error while trying to send error message in auto-roles remove command" +
          error
      );
    }
  }
}
