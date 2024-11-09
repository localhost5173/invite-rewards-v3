import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db";
import { Helpers } from "../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
) {
  try {
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });
    const leaderboard = await db.leaderboards.getLeaderboard(
      guildId,
      leaderboardType
    );

    if (!leaderboard || leaderboard.length === 0) {
      await interaction.followUp({
        content: `No data available for the ${leaderboardType} leaderboard.`,
        ephemeral: true,
      });
      return;
    }

    const entries = leaderboard.map((entry, index) => {
      return {
        position: index + 1,
        user: `<@${entry.userId}>`,
        invites: entry.inviteCount,
      };
    });

    // Format the leaderboard data into a plaintext message
    const leaderboardMessage = formatLeaderboardMessage(
      leaderboardType,
      entries
    );

    await interaction.followUp({
      content: leaderboardMessage,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error while handling get leaderboards command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}

/**
 * Formats the leaderboard data into a plaintext message.
 */
function formatLeaderboardMessage(
  leaderboardType: string,
  entries: { position: number; user: string; invites: number }[]
): string {
  let message = `**${
    leaderboardType.charAt(0).toUpperCase() + leaderboardType.slice(1)
  } Leaderboard:**\n\n`;

  entries.forEach((entry) => {
    message += `${entry.position}. ${entry.user} - ${entry.invites} invites\n`;
  });

  return message;
}
