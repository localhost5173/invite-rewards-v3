import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {
  const guildId = interaction.guildId!;

  try {
    const apiEmbed = await db.welcomer.getEmbed(guildId, type, location);

    if (!apiEmbed) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            `welcomer.viewEmbed.noEmbed`
          )
        ],
        ephemeral: true,
      });

      return;
    }

    const embed = new EmbedBuilder(apiEmbed)
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    
  } catch (error) {
    cs.error("Error viewing embed: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
