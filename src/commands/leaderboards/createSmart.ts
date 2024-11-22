import {
  ChannelType,
  ChatInputCommandInteraction,
  PartialGroupDMChannel,
} from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";
import { Leaderboards } from "../../utils/leaderboards/Leaderboards";

export default async function (
  interaction: ChatInputCommandInteraction,
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
) {
  try {
    const guildId = interaction.guildId!;
    const channelId = interaction.channel?.id;
    const channel = interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    if (
      !channelId ||
      !channel ||
      !channel.isTextBased() ||
      channel.type !== ChannelType.GuildText ||
      channel instanceof PartialGroupDMChannel
    ) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(guildId, "general.textChannelOnly"),
        ],
        ephemeral: true,
      });
      return;
    }

    const smartLeaderboards = await db.leaderboards.getSmart(guildId);

    if (smartLeaderboards.length >= 1) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "leaderboards.smart.maxLeaderboards"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    // Get the leaderboard
    const leaderboard = await db.leaderboards.getLeaderboard(
      guildId,
      leaderboardType
    );

    const entries = leaderboard.map((entry, index) => {
      return {
        position: index + 1,
        user: `<@${entry.userId}>`,
        invites: entry.inviteCount,
      };
    });

    // Format the leaderboard data into a plaintext message
    const leaderboardMessage = await Leaderboards.formatLeaderboardMessage(
      guildId,
      entries
    );

    const embed = await Embeds.createEmbed(
      guildId,
      `leaderboards.smart.${leaderboardType}`,
      {
        leaderboard: leaderboardMessage,
      }
    );

    const message = await channel.send({ embeds: [embed] });

    await db.leaderboards.saveSmart(
      guildId,
      channelId,
      message.id,
      leaderboardType
    );

    await interaction.followUp({
      embeds: [await Embeds.createEmbed(guildId, "leaderboards.smart.success")],
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error while handling get leaderboards command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
