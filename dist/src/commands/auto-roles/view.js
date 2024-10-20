import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";
export default async function (interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guildId;
        const autoRoles = await db.autoRoles.getRoles(guildId);
        // Create fields for the embed
        const fields = autoRoles.map((role) => ({
            name: "Role",
            value: `<@&${role}>`,
            inline: true,
        }));
        // Create the embed
        const embed = Embeds.infoEmbed("Auto Roles for this Guild", {
            title: "Auto Roles",
            fields: fields,
            footerText: "Auto Roles Information",
            timestamp: true,
            thumbnail: interaction.guild?.iconURL() ?? undefined,
        });
        // Send the embed as a reply
        return await interaction.followUp({ embeds: [embed] });
    }
    catch (error) {
        cs.error(error);
        await interaction.followUp({
            content: "An error occurred while executing this command",
        });
    }
}
