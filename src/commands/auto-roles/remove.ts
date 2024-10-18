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
        embeds: [Embeds.errorEmbed("Role not found")],
        ephemeral: true,
      });
    }

    // Check if the role is an auto role
    const autoroles = await db.autoRoles.getRoles(interaction.guildId!);
    if (!autoroles.includes(role.id)) {
      return interaction.followUp({
        embeds: [Embeds.errorEmbed("Role is not an auto role")],
        ephemeral: true,
      });
    }

    // Remove the role from auto-assign
    await db.autoRoles.removeRole(interaction.guildId!, role.id);

    return await interaction.followUp({
      embeds: [Embeds.successEmbed(`Role <@&${role.id}> is no longer an auto role`)],
    });
  } catch (error: unknown) {
    cs.error(error as string);
    await interaction.followUp({
      content: "An error occurred while executing this command",
    });
  }
}
