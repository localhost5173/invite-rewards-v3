import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";
import { Helpers } from "../../utils/helpers/helpers";
import { getNativeLanguageName } from "../../utils/db/categories/languages";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const language = await db.languages.getLanguage(interaction.guildId!);

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          interaction.guildId!,
          "language.view.success",
          {
            language: getNativeLanguageName(language) || "Unknown",
          }
        ),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while viewing language: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
