import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { getInvitedUsersByUser } from '../../firebase/invites.ts';
import { invitedListEmbed, invitedListErrorEmbed, noInvitesInvitedListEmbed } from '../../utils/embeds/invites.ts';
import { devMode } from '../../index.ts';

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

export async function run({ interaction, client, handler }: SlashCommandProps) {
    const targetUser = interaction.options.getUser('user');
    const guildId = interaction.guild?.id;

    await interaction.deferReply({ ephemeral: true });

    if (!guildId) {
        const embed = invitedListErrorEmbed("This command can only be used in a guild.");
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    if (!targetUser) {
        const embed = invitedListErrorEmbed("User not found.");
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    try {
        const invitedUsersIds = await getInvitedUsersByUser(guildId, targetUser.id);
        const invitedUsersMentions = invitedUsersIds.map((invitedUser) => `<@!${invitedUser}>`);

        if (invitedUsersMentions.length === 0) {
            const embed = noInvitesInvitedListEmbed(targetUser);
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            const embed = invitedListEmbed(targetUser, invitedUsersMentions);
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error(`Failed to get invited users for ${targetUser.id}:`, error);
        const embed = invitedListErrorEmbed("An error occurred while fetching the invited users.");

        try {
            return interaction.followUp({ embeds: [embed], ephemeral: true });
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
};