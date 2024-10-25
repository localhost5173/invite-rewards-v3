import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { devMode } from '../../index.js';
import { db } from '../../utils/db/db.js';

export const data: CommandData = {
    name: 'inviter',
    description: 'Check who invited a user',
    options: [
        {
            name: 'user',
            description: 'The user to check the inviter for',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
};

export async function run({ interaction, client }: SlashCommandProps) {
    const targetUser = interaction.options.getUser('user', false);
    const userId = interaction.user.id;
    const guildId = interaction.guildId!;

    try {
        await interaction.deferReply({ ephemeral: true });


        if (!targetUser) {
            return interaction.followUp({ content: "Please provide a user", ephemeral: true });
        }
        // Find inviter of the target user
        const inviterId = await db.invites.joinedUsers.getInviterOfUser(guildId, targetUser.id);

        if (!inviterId) {
            return interaction.followUp({ content: "I couldn't find the inviter for this user", ephemeral: true });
        }

        const inviter = await client.users.fetch(inviterId);

        if (!inviter) {
            return interaction.followUp({ content: "I could not resolve the inviter.", ephemeral: true });
        }

        return interaction.followUp({ content: `The inviter is <@${inviter.id}>`, ephemeral: true });
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