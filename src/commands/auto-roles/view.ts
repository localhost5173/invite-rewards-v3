import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId!;
    const guildIcon = interaction.guild!.iconURL()!;
    const autoRoles = await db.autoRoles.getRoles(guildId);

    return await interaction.followUp({
      embeds: [
        await Embeds.autoRoles.view.success(guildId, autoRoles, guildIcon),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while viewing auto roles: " + error);

    // Try to send an error message to the user
    try {
      const guildId = interaction.guildId!;
      await interaction.followUp({
        embeds: [await Embeds.system.errorWhileExecutingCommand(guildId)],
        ephemeral: true,
      });
    } catch (error: unknown) {
      cs.error(
        "Error while trying to send error message in auto-roles view command" +
          error
      );
    }
  }
}
