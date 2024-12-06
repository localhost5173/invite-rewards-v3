import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
export default async function (interaction, type, location) {
    const guildId = interaction.guildId;
    try {
        await interaction.deferReply({ ephemeral: true });
        cs.dev(`Removing embed for ${location} ${type}`);
        await db.welcomer.removeEmbed(guildId, type, location);
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, `welcomer.removeEmbed.${type}.${location}.success`),
            ],
        });
    }
    catch (error) {
        cs.error("Error removing embed: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
