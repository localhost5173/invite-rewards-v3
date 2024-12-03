import { ApplicationCommandOptionType } from "discord.js";
import { devMode } from "../../index.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
export const data = {
    name: "invited-list",
    description: "Get all the users invited by a specific user",
    options: [
        {
            name: "user",
            description: "The user to check the invites for",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
};
export async function run({ interaction }) {
    const targetUser = interaction.options.getUser("user", false);
    const guildId = interaction.guild.id;
    try {
        await interaction.deferReply({ ephemeral: true });
        if (!targetUser) {
            const embed = await Embeds.createEmbed(guildId, "invitedList.noUserProvided");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
        const invitedUsersIds = await db.invites.usedInvites.getInvitedList(guildId, targetUser.id);
        const invitedUsersMentions = invitedUsersIds.map((invitedUser) => `<@!${invitedUser}>`);
        if (invitedUsersMentions.length === 0) {
            const embed = await Embeds.createEmbed(guildId, "invitedList.noInvites", {
                user: targetUser.username,
            });
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
        else {
            const embed = await Embeds.createEmbed(guildId, "invitedList.success", {
                user: targetUser.username,
                invitedUsers: invitedUsersMentions.join(", "),
            });
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    }
    catch (error) {
        console.error(`Failed to get invited users for:`, error);
        await Helpers.trySendCommandError(interaction);
    }
}
export const options = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};
