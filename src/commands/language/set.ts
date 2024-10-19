import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import {
  LanguagesList,
} from "../../utils/db/categories/languages";
import { Embeds } from "../../utils/embeds/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = interaction.options.getString("language");

    if (!language) {
      return interaction.reply({
        embeds: [await Embeds.languages.set.noLanguage(interaction.guildId!)],
        ephemeral: true,
      });
    }

    // Check if the language is valid
    if (!Object.values(LanguagesList).includes(language as LanguagesList)) {
      return interaction.reply({
        embeds: [
          await Embeds.languages.set.invalidLanguage(interaction.guildId!),
        ],
        ephemeral: true,
      });
    }

    // Set the language in the database
    await db.languages.setLanguage(interaction.guildId!, language);
    interaction.followUp({
      embeds: [await Embeds.languages.set.success(language)],
    });
  } catch (error) {
    cs.error("Error while setting language: " + error);
    try {
      await interaction.reply({
        embeds: [
          await Embeds.system.errorWhileExecutingCommand(interaction.guildId!),
        ],
        ephemeral: true,
      });
    } catch (error) {
      cs.error("Error while sending followup message for error:" + error);
    }
  }
}