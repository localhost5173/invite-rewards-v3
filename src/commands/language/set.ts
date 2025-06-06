import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { getNativeLanguageName, LanguagesList } from "../../utils/db/categories/languages.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = interaction.options.getString("language");
    const guildId = interaction.guildId!;

    if (!language) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "language.set.noLanguage"
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the language is valid
    if (!Object.values(LanguagesList).includes(language as LanguagesList)) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "language.set.invalidLanguage"
          ),
        ],
        ephemeral: true,
      });
    }

    // Set the language in the database
    await db.languages.setLanguage(guildId, language);
    interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "language.set.success", {
          language: getNativeLanguageName(language) || "Unknown",
        }),
      ],
    });
    db.usage.incrementUses(guildId, UsageCommands.LanguageSet);
  } catch (error) {
    cs.error("Error while setting language: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
