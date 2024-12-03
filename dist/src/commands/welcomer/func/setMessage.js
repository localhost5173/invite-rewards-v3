import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
export default async function (interaction, type, location) {
    const guildId = interaction.guildId;
    const message = interaction.options.getString("message", true);
    try {
        await interaction.deferReply({ ephemeral: true });
        if (type === "welcome") {
            await db.welcomer.setWelcomeMessage(guildId, message, location);
        }
        else {
            await db.welcomer.setFarewellMessage(guildId, message, location);
        }
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, `welcomer.setMessage.${type}.${location}.success`, {
                    message,
                }),
            ],
        });
    }
    catch (error) {
        cs.error(`Error while setting ${type} message: ` + error);
        await Helpers.trySendCommandError(interaction);
    }
}
