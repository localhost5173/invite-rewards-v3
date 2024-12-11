import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { devMode } from '../../index.js';
import { db } from '../../utils/db/db.js';
import { Embeds } from '../../utils/embeds/embeds.js';
import { Helpers } from '../../utils/helpers/helpers.js';
import { UsageCommands } from '../../utils/db/models/usageModel.js';

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
        await interaction.deferReply();

        if (!targetUser) {
            const embed = await Embeds.createEmbed(guildId, 'inviter.noUserProvided');
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        // Find inviter of the target user
        const inviterId = await db.invites.joinedUsers.getInviterOfUser(guildId, targetUser.id);

        if (!inviterId) {
            const embed = await Embeds.createEmbed(guildId, 'inviter.noInviterFound');
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const inviter = await client.users.fetch(inviterId);

        if (!inviter) {
            const embed = await Embeds.createEmbed(guildId, 'inviter.inviterUnresolved');
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const embed = await Embeds.createEmbed(guildId, 'inviter.success', {
            user: `<@${targetUser.id}>`,
            inviter: `<@${inviter.id}>`
        });
        interaction.followUp({ embeds: [embed] });
        db.usage.incrementUses(guildId, UsageCommands.InviterInfo);
    } catch (error) {
        console.error(`Failed to get invites for user ${userId}:`, error);
        
        await Helpers.trySendCommandError(interaction);
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
