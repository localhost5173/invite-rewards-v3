import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
export default async function (interaction) {
    try {
        const guildId = interaction.guildId;
        await db.verification.disable(guildId);
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "verification.disable.success"),
            ],
            ephemeral: true,
        });
    }
    catch (error) {
        cs.error("Error while removing the verification system: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
