import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId!;
    const guildIcon = interaction.guild!.iconURL()!;
    const autoRoles = await db.autoRoles.getRoles(guildId) || [];

    return await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "autoRoles.view.success", {
          autoRoles: autoRoles.map((role: string) => `<@&${role}>`).join(", ") || " ",
          guildIcon: guildIcon,
        }),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while viewing auto roles: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
