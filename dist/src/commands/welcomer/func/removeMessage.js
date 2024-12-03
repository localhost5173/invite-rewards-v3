import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
export default async function (interaction, type, location) {
    const guildId = interaction.guildId;
    try {
        await interaction.deferReply({ ephemeral: true });
        if (type === "welcome") {
            await db.welcomer.removeWelcomeMessage(guildId, location);
        }
        else {
            await db.welcomer.removeFarewellMessage(guildId, location);
        }
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, `welcomer.removeEmbed.${type}.${location}.success`),
            ],
        });
    }
    catch (error) {
        cs.error(`Error while removing ${type} message: ` + error);
        await Helpers.trySendCommandError(interaction);
    }
}
