import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { cs } from "../../utils/console/customConsole.js";
import { Leaderboards } from "../../utils/leaderboards/Leaderboards.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
) {
  try {
    const guildId = interaction.guildId!;

    await interaction.deferReply();
    const leaderboard = await db.leaderboards.getLeaderboard(
      guildId,
      leaderboardType
    );

    if (!leaderboard || leaderboard.length === 0) {
      await interaction.followUp({
        embeds: [await Embeds.createEmbed(guildId, "leaderboards.view.empty")],
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
    const leaderboardMessage = await Leaderboards.formatLeaderboardMessage(guildId, entries);

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "leaderboards.view.success", {
          leaderboard: leaderboardMessage,
        }),
      ],
    });

    switch (leaderboardType) {
      case "daily":
        db.usage.incrementUses(guildId, UsageCommands.LeaderboardViewDaily);
        break;
      case "weekly":
        db.usage.incrementUses(guildId, UsageCommands.LeaderboardViewWeekly);
        break;
      case "monthly":
        db.usage.incrementUses(guildId, UsageCommands.LeaderboardViewMonthly);
        break;
      case "alltime":
        db.usage.incrementUses(guildId, UsageCommands.LeaderboardViewAllTime);
        break;
    }
  } catch (error) {
    cs.error("Error while handling get leaderboards command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}