import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
export default async function (interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guildId;
        const autoRoles = await db.autoRoles.getRoles(guildId) || [];
        return await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, "autoRoles.view.success", {
                    autoRoles: autoRoles.map((role) => `<@&${role}>`).join(", ") || " "
                }),
            ],
        });
    }
    catch (error) {
        cs.error("Error while viewing auto roles: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
