import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

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
        content: `No embed set for the ${location} ${type} message.`,
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
