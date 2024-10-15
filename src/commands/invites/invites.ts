import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { getTotalInvitesForUser, getSplitInvitesForUser } from '../../firebase/invites.ts';
import { devMode } from '../../index.ts';
import { inviteBreakdownEmbed, invitesErrorEmbed, totalInvitesEmbed } from '../../utils/embeds/invites.ts';
import { hasVoted } from '../../utils/topgg/voteLock.ts';
import { voteLockedCommandEmbed } from '../../utils/embeds/system.ts';

export const data: CommandData = {
    name: 'invites',
    description: 'Displays the number of invites a user has made!',
    options: [
        {
            name: 'user',
            description: 'The user to check invites for',
            type: ApplicationCommandOptionType.User,
            required: false,
        },
        {
            name: 'breakdown',
            description: 'Whether to both fake and real invites',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        }
    ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
    if (!await hasVoted(interaction.user.id)) {
        return interaction.reply({
            embeds: [voteLockedCommandEmbed()],
            ephemeral: true,
        });
    }
    // Get the user ID from the interaction
    const targetUser = interaction.options.getUser('user');
    const breakDown = interaction.options.getBoolean('breakdown');
    const userId = interaction.user.id;
    const guildId = interaction.guild?.id; // Get the guild ID from the interaction

    await interaction.deferReply({ ephemeral: true });

    if (!guildId) {
        return interaction.reply("This command can only be used in a guild.");
    }

    if (
        targetUser &&
        targetUser.id !== interaction.user.id &&
        !(interaction.member?.permissions instanceof PermissionsBitField &&
            interaction.member.permissions.has(PermissionFlagsBits.Administrator))
    ) {
        return interaction.followUp("You do not have permission to check other users' invites.");
    }

    try {
        // Find the guild document in the database
        if (breakDown) {
            // Handle the breakdown of real and fake invites
            const invites = await getSplitInvitesForUser(guildId, targetUser?.id || userId);
            const realInvites = invites.real || 0;
            const fakeInvites = invites.fake || 0;

            const embed = inviteBreakdownEmbed(targetUser, realInvites, fakeInvites);
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
            // Handle the total invite count
            const inviteCount = await getTotalInvitesForUser(guildId, targetUser?.id || userId);

            const embed = totalInvitesEmbed(targetUser, inviteCount);
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error(`Failed to get invites for user ${userId}:`, error);
        const embed = invitesErrorEmbed();
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: [],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    deleted: false,
};