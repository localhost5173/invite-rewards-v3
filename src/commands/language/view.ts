import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = await db.languages.getLanguage(interaction.guildId!);

    await interaction.followUp({
      embeds: [await Embeds.languages.view.success(language)],
    });
  } catch (error: unknown) {
    cs.error("Error while viewing language: " + error);

    try {
      await interaction.followUp({
        embeds: [
          await Embeds.system.errorWhileExecutingCommand(interaction.guildId!),
        ],
      });
    } catch (error: unknown) {
      cs.error("Error while sending error followup in viewLanguage: " + error);
    }
  }
}
