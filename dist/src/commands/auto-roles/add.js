import { Embeds } from "../../utils/embeds/embeds";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";
export default async function (interaction) {
    try {
        const role = interaction.options.getRole("role");
        await interaction.deferReply({ ephemeral: true });
        // Check if the role exists
        if (!role) {
            return interaction.followUp({
                embeds: [Embeds.errorEmbed("Role not found")],
                ephemeral: true,
            });
        }
        // Check if the role is managed
        if (role.managed) {
            return interaction.followUp({
                embeds: [Embeds.errorEmbed("Cannot assign a managed role")],
                ephemeral: true,
            });
        }
        // Check if the bot has the necessary permissions
        if (!interaction.guild.members.me ||
            interaction.guild.members.me.roles.highest.position <= role.position) {
            return interaction.followUp({
                embeds: [
                    Embeds.errorEmbed("My highest role must be higher than the role to be managed in order to assign it. Move the Invite Rewards role above the role you want to assign. For assistance, visit the support server via `/help`."),
                ],
                ephemeral: true,
            });
        }
        // Check if the role is already auto-assigned
        const autoroles = await db.autoRoles.getRoles(interaction.guildId);
        if (autoroles.includes(role.id)) {
            return interaction.followUp({
                embeds: [Embeds.warnEmbed("Role is already an auto role")],
                ephemeral: true,
            });
        }
        // Add the role to auto-assign
        await db.autoRoles.addRole(interaction.guildId, role.id);
        return await interaction.followUp({
            embeds: [Embeds.successEmbed(`Role ${role.name} added as an auto role`)],
        });
    }
    catch (error) {
        cs.error(error);
        await interaction.followUp({
            content: "An error occurred while executing this command",
            ephemeral: true,
        });
    }
}
