import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { devMode } from '../../index.js';
import { db } from '../../utils/db/db.js';

export const data: CommandData = {
    name: 'history',
    description: 'See the join and leave history of a user',
    options: [
        {
            name: 'user',
            description: 'The user to get the history for',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
};

export async function run({ interaction }: SlashCommandProps) {
    const targetUser = interaction.options.getUser('user', false);
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    try {
        await interaction.deferReply({ ephemeral: true });

        if (!targetUser) {
            return interaction.followUp({ content: "Please provide a user", ephemeral: true });
        }

        const history = await db.invites.joinedUsers.getHistoryForUser(guildId, targetUser.id);

        // Check if history is empty
        if (history.length === 0) {
            return interaction.followUp({ content: `No history found for <@${targetUser.id}>.`, ephemeral: true });
        }

        // Format history with Discord timestamps and relative time
        const historyText = history.map(entry => {
            const joinedAtTimestamp = `<t:${Math.floor(entry.joinedAt.getTime() / 1000)}:D> (<t:${Math.floor(entry.joinedAt.getTime() / 1000)}:R>)`;
            const leftAtTimestamp = entry.leftAt
                ? `<t:${Math.floor(entry.leftAt.getTime() / 1000)}:D> (<t:${Math.floor(entry.leftAt.getTime() / 1000)}:R>)`
                : "Present";
            return `Joined: ${joinedAtTimestamp}, Left: ${leftAtTimestamp}`;
        }).join('\n');

        // Respond with formatted history
        return interaction.followUp({
            content: `Join and leave history for <@${targetUser.id}>:\n${historyText}`,
            ephemeral: true
        });

    } catch (error) {
        console.error(`Failed to get invites for user ${userId}:`, error);

        try {
            return interaction.followUp({ content: "There was an error executing the command", ephemeral: true });
        } catch (error: unknown) {
            console.error(`Failed to send error message in inviter:`, error);
        }
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    deleted: false,
};
