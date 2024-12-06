import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
export default async function (interaction, type, location) {
    try {
        const guildId = interaction.guildId;
        await interaction.deferReply({ ephemeral: true });
        let message;
        if (type === "welcome") {
            message = await db.welcomer.getWelcomeMessage(guildId, location);
        }
        else {
            message = await db.welcomer.getFarewellMessage(guildId, location);
        }
        if (!message) {
            return await interaction.followUp({
                embeds: [
                    await Embeds.createEmbed(guildId, `welcomer.viewMessage.noMessage`),
                ],
            });
        }
        else {
            await interaction.followUp({
                embeds: [
                    await Embeds.createEmbed(guildId, "welcomer.viewMessage.success", {
                        message: message || "No message set",
                    }),
                ],
            });
        }
    }
    catch (error) {
        cs.error(`Error while viewing ${type} message: ` + error);
        await Helpers.trySendCommandError(interaction);
    }
}
