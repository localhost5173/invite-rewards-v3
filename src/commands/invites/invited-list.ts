import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { devMode } from '../../index.js';
import { db } from '../../utils/db/db.js';

export const data: CommandData = {
    name: 'invited-list',
    description: 'Get all the users invited by a specific user',
    options: [
        {
            name: 'user',
            description: 'The user to check the invites for',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
};

export async function run({ interaction }: SlashCommandProps) {
    const targetUser = interaction.options.getUser('user', false);
    const guildId = interaction.guild!.id;

    try {
        await interaction.deferReply({ ephemeral: true });

        if (!targetUser) {
            return interaction.followUp({ content: "Please provide a user", ephemeral: true });
        }

        const invitedUsersIds = await db.invites.usedInvites.getInvitedList(guildId, targetUser.id);
        const invitedUsersMentions = invitedUsersIds.map((invitedUser) => `<@!${invitedUser}>`);

        if (invitedUsersMentions.length === 0) {
            return interaction.followUp({ content: `${targetUser.username} has not invited any users.`, ephemeral: true });
        } else {
            return interaction.followUp({
                content: `Users invited by ${targetUser.username}:\n${invitedUsersMentions.join('\n')}`,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error(`Failed to get invited users for:`, error);

        try {
            return interaction.followUp({
                content: "An error occurred while fetching the invited users.",
                ephemeral: true
            });
        } catch (error) {
            console.error(`Failed to send error message in invited-list:`, error);
        }
    }
}


export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};