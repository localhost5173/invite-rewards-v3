import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
import { getNativeLanguageName } from "../../utils/db/categories/languages";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = await db.languages.getLanguage(interaction.guildId!);

    await interaction.followUp({
      content: `The current language is ${getNativeLanguageName(language)}`,
    });
  } catch (error: unknown) {
    console.error("Error while viewing language: " + error);

    try {
      await interaction.followUp({
        content: "An error occurred while executing this command",
      });
    } catch (error: unknown) {
      cs.error("Error while sending error followup in viewLanguage: " + error);
    }
  }
}
