import { PermissionFlagsBits, } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { db } from "../../utils/db/db.js";
export default async function (interaction) {
    if (!interaction.guild)
        return;
    if (!interaction.channel)
        return;
    // Handle button interactions
    if (interaction.isButton() && interaction.customId.startsWith("role-")) {
        const roleId = interaction.customId.split("-")[1];
        const member = interaction.member;
        const role = interaction.guild.roles.cache.get(roleId) ||
            (await interaction.guild.roles.fetch(roleId));
        if (!member) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "reactionRoles.roleNoLongerExists"),
                ],
                ephemeral: true,
            });
            return;
        }
        if (!role) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "reactionRoles.roleNoLongerExists"),
                ],
                ephemeral: true,
            });
            return;
        }
        // Check if the bot has the necessary permissions
        const hasPermissions = await checkPermissions(member, role);
        if (!hasPermissions) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "roles.noPermissions", {
                        role: `<@&${role.id}>`,
                    }),
                ],
                ephemeral: true,
            });
            return;
        }
        // Check if the user already has the role
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(role);
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "reactionRoles.roleRemoved", {
                        role: `<@&${role.id}>`,
                    }),
                ],
                ephemeral: true,
            });
            await db.reactionRoles.incrementRemoves(interaction.guildId);
            return;
        }
        // Assign the role
        try {
            await member.roles.add(role);
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "reactionRoles.roleAssigned", {
                        role: `<@&${role.id}>`,
                    }),
                ],
                ephemeral: true,
            });
            await db.reactionRoles.incrementAssigns(interaction.guildId);
        }
        catch (error) {
            cs.error("An error occurred while assigning role: " + error);
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "reactionRoles.error"),
                ],
                ephemeral: true,
            });
        }
    }
}
async function checkPermissions(member, role) {
    return new Promise((resolve) => {
        const bot = member.guild.members.me;
        if (!bot) {
            resolve(false);
            return;
        }
        if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
            resolve(false);
            return;
        }
        if (role.managed) {
            resolve(false);
            return;
        }
        if (bot.roles.highest.position <= role.position) {
            resolve(false);
            return;
        }
        resolve(true);
    });
}
