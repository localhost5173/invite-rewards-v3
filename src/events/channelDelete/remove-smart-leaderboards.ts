import { GuildChannel } from "discord.js";
import { getSmartLeaderboards, isSmartLeaderboardChannel, removeSmartLeaderboard } from "../../firebase/leaderboards.js";
import { devMode } from "../../index.js";

export default async function (channel: GuildChannel) {
  try {
    // Check if the deleted channel was associated with any smart leaderboard
    const isLeaderboardChannel = await isSmartLeaderboardChannel(
      channel.guild.id,
      channel.id
    );

    // If it was a leaderboard channel, remove all associated leaderboards from the DB
    if (isLeaderboardChannel) {
      const leaderboards = await getSmartLeaderboards(channel.guild.id);

      // Filter leaderboards associated with the deleted channel
      const leaderboardsToRemove = leaderboards.filter(
        (leaderboard : any) => leaderboard.channelId === channel.id
      );

      // Remove each leaderboard associated with the deleted channel
      for (const leaderboard of leaderboardsToRemove) {
        await removeSmartLeaderboard(channel.guild.id, leaderboard.messageId);
      }

      devMode && console.log(
        `All smart leaderboards associated with channel ${channel.id} in guild ${channel.guild.id} have been removed.`
      );
    }
  } catch (error) {
    console.error(
      `Failed to process leaderboard removal for channel ${channel.id}:`,
      error
    );
  }
}