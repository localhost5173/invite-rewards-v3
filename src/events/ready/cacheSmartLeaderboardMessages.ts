import { client } from "../../index.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { TextChannel } from "discord.js";

const BATCH_SIZE = 50; // Number of messages to fetch in each batch
const RATE_LIMIT_DELAY = 1000; // Delay in milliseconds between batches

export default async function () {
  try {
    const guilds = await client.guilds.fetch();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, guild] of guilds) {
      const fullGuild = await client.guilds.fetch(guild.id);
      const smartLeaderboards = await db.leaderboards.getSmartLeaderboards(
        fullGuild.id
      );

      for (let i = 0; i < smartLeaderboards.length; i += BATCH_SIZE) {
        const batch = smartLeaderboards.slice(i, i + BATCH_SIZE);

        for (const smartLeaderboard of batch) {
          const channelId = smartLeaderboard.channelId;
          const messageId = smartLeaderboard.messageId;

          try {
            const channel = (await fullGuild.channels.fetch(
              channelId
            )) as TextChannel;
            if (channel) {
              const message = await channel.messages.fetch(messageId);
              if (message) {
                cs.dev(
                  `Cached message ${messageId} in channel ${channelId} for guild ${guild.id}`
                );
              }
            }
          } catch (error) {
            cs.error(
              `Error caching message ${messageId} in channel ${channelId} for guild ${guild.id}: ${error}`
            );

            try {
              await db.leaderboards.deleteSmart(
                fullGuild.id,
                channelId,
                messageId
              );
              cs.dev(
                `Deleted smart leaderboard for message ${messageId} in channel ${channelId} for guild ${guild.id}`
              );
            } catch {
              cs.error(
                `Error deleting smart leaderboard for message ${messageId} in channel ${channelId} for guild ${guild.id}`
              );
            }
          }
        }

        // Delay between batches to handle rate limits
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }
  } catch (error) {
    cs.error("Error while caching smart leaderboard messages: " + error);
  }
}
