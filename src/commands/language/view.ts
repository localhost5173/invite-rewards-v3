import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { getNativeLanguageName } from "../../utils/db/categories/languages.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guildId!;

    const language = await db.languages.getLanguage(guildId);

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          guildId,
          "language.view.success",
          {
            language: getNativeLanguageName(language) || "Unknown",
          }
        ),
      ],
    });
    db.usage.incrementUses(guildId, UsageCommands.LanguageView);
  } catch (error: unknown) {
    cs.error("Error while viewing language: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
