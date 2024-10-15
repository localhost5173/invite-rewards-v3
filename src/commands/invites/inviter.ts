import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType, UserResolvable } from 'discord.js';
import { getInviterForUser } from '../../firebase/invites.ts';
import { devMode } from '../../index.ts';
import { inviterEmbed, inviterErrorEmbed, noInviterEmbed } from '../../utils/embeds/invites.ts';

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

export async function run({ interaction, client, handler }: SlashCommandProps) {
    // Get the user ID from the interaction
    const targetUser = interaction.options.getUser('user');
    const userId = interaction.user.id;
    const guildId = interaction.guild?.id; // Get the guild ID from the interaction

    await interaction.deferReply({ ephemeral: true });

    if (!guildId) {
        const embed = inviterErrorEmbed("This command can only be used in a guild.");
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!targetUser) {
        const embed = inviterErrorEmbed("User not found.");
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    try {
        // Find inviter of the target user
        const inviterId = await getInviterForUser(guildId, targetUser.id);

        if (!inviterId) {
            const embed = noInviterEmbed(targetUser);
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const inviter = await client.users.fetch(inviterId as UserResolvable);

        if (!inviter) {
            const embed = inviterErrorEmbed("The inviter was not found.");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        // Use the non-pinging mention format <@!userId> for both users
        const embed = inviterEmbed(targetUser, inviter);
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error(`Failed to get invites for user ${userId}:`, error);
        const embed = inviterErrorEmbed("An error occurred while fetching the invite data.");
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    deleted: false,
};