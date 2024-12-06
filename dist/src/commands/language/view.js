import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { getNativeLanguageName } from "../../utils/db/categories/languages.js";
export default async function (interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const language = await db.languages.getLanguage(interaction.guildId);
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(interaction.guildId, "language.view.success", {
                    language: getNativeLanguageName(language) || "Unknown",
                }),
            ],
        });
    }
    catch (error) {
        cs.error("Error while viewing language: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
