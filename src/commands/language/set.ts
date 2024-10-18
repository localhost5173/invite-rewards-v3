import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import {
  LanguagesList,
  TranslatedLanguages,
} from "../../utils/db/categories/languages";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = interaction.options.getString("language");

    if (!language) {
      return interaction.reply({
        content: "Please provide a language",
        ephemeral: true,
      });
    }

    // Check if the language is valid
    if (!Object.values(LanguagesList).includes(language as LanguagesList)) {
      return interaction.reply({
        content: "Invalid language",
        ephemeral: true,
      });
    }
    
    // Set the language in the database
    await db.languages.setLanguage(interaction.guildId!, language);
    interaction.followUp({
      content: `Language set to ${
        TranslatedLanguages[language as LanguagesList]
      }`,
    });
  } catch (error) {
    cs.error("Error while setting language: " + error);
    try {
      await interaction.reply({
        content: "An error occurred while executing this command",
        ephemeral: true,
      });
    } catch (error) {
      cs.error("Error while sending followup message for error:" + error);
    }
  }
}
