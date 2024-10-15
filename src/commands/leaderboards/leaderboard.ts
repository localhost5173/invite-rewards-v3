import type { CommandData, SlashCommandProps, CommandOptions } from 'commandkit';
import { getLeaderboardByType } from '../../firebase/leaderboards.ts';
import { viewLeaderboardEmbed } from '../../utils/embeds/leaderboards.ts';
import { devMode } from '../../index.ts';
import { hasVoted } from '../../utils/topgg/voteLock.ts';
import { voteLockedCommandEmbed } from '../../utils/embeds/system.ts';

export const data: CommandData = {
    name: 'leaderboard',
    description: 'Displays the top inviters in the server.',
    options: [
        {
            name: 'type',
            description: 'The type of leaderboard to display',
            type: 3, // STRING type
            required: true,
            choices: [
                { name: 'All Time', value: 'allTime' },
                { name: 'Monthly', value: 'monthly' },
                { name: 'Weekly', value: 'weekly' },
                { name: 'Daily', value: 'daily' },
            ],
        },
    ],
};

export async function run({ interaction, client }: SlashCommandProps) {
    if (!interaction.guild) return;
    if (!await hasVoted(interaction.user.id)) {
        return interaction.reply({
            embeds: [voteLockedCommandEmbed()],
            ephemeral: true,
        });
    }
    const guildId = interaction.guildId!;
    const leaderboardType = interaction.options.getString('type'); // Get the leaderboard type from the command options

    await interaction.deferReply({ ephemeral: true });

    if (!leaderboardType) {
        return interaction.followUp("Please provide a valid leaderboard type.");
    }

    if (!['allTime', 'monthly', 'weekly', 'daily'].includes(leaderboardType)) {
        return interaction.followUp("Please provide a valid leaderboard type.");
    }

    try {
        // Fetch the correct leaderboard based on type
        const leaderboard = await getLeaderboardByType(guildId, leaderboardType as any);

        if (!leaderboard.length) {
            return interaction.followUp(`No invite data found for the ${leaderboardType} leaderboard.`);
        }

        // Create the embed with the formatted leaderboard
        const embed = await viewLeaderboardEmbed(client, leaderboard, leaderboardType);

        return interaction.followUp({ embeds: [embed] });
    } catch (error) {
        console.error(`Failed to fetch invite leaderboard:`, error);
        return interaction.followUp("An error occurred while fetching the invite leaderboard.");
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ['ViewAuditLog'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    deleted: false,
};