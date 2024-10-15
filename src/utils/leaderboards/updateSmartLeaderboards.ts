import { EmbedBuilder, TextChannel, DiscordAPIError } from "discord.js";
import { client, devMode } from "../../index.js";
import {
  getLeaderboardByType,
  getSmartLeaderboards,
  removeSmartLeaderboard,
} from "../../firebase/leaderboards.js";
import { sendMessageToInfoChannel } from "../../firebase/channels.js";

export default async function updateSmartLeaderboards(
  guildId: string
): Promise<void> {
  try {
    const smartLeaderboards = await getSmartLeaderboards(guildId);

    for (const entry of smartLeaderboards) {
      await updateLeaderboardMessage(
        guildId,
        entry.channelId,
        entry.messageId,
        entry.leaderboardType
      );
    }
  } catch (error) {
    console.error("Failed to update smart leaderboards:", error);
  }
}

async function updateLeaderboardMessage(
  guildId: string,
  channelId: string,
  messageId: string,
  type: string
) {
  try {
    devMode && console.log("UPDATING SMART LEADERBOARD");

    // Fetch the channel
    const channel = (await client.channels.fetch(channelId)) as TextChannel;

    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return;
    }

    // Fetch the message
    const message = await channel.messages.fetch(messageId);

    if (!message) {
      console.error(`Message with ID ${messageId} not found.`);
      return;
    }

    // Fetch and format the leaderboard data based on `entry.type`
    const leaderboard = await getLeaderboardByType(guildId, type as any);

    // Format the leaderboard data into readable entries
    const formattedLeaderboard = await Promise.all(
      leaderboard.map(async (entry: any, index: any) => {
        const user = await client.users.fetch(entry.userId);
        return `**${index + 1}. ${user.tag}** - ${entry.invites} invites`;
      })
    );

    // Create the embed with the formatted leaderboard
    const embed = new EmbedBuilder()
      .setTitle(`${type} Leaderboard`)
      .setDescription(
        formattedLeaderboard.length > 0
          ? formattedLeaderboard.join("\n")
          : "No data available for this leaderboard."
      )
      .setColor(0x00ae86)
      .setFooter({ text: "Invite Leaderboard" });

    // Update the message content
    await message.edit({ embeds: [embed] });

    devMode &&
      console.log(
        `Updated leaderboard message ${messageId} in channel ${channelId}`
      );
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === 10008) {
      try {
        console.error(
          `Message with ID ${messageId} not found. Removing entry from database.`
        );
        sendMessageToInfoChannel(
          guildId,
          `Smart leaderboard messaage not found. Removing entry from database. For assistance, visit the support server via \`help\`.`
        );
        await removeSmartLeaderboard(guildId, messageId);
      } catch (error) {
        console.error(`Failed to remove smart leaderboard entry while not being able to find smart leaderboard message:`, error);
      }
    } else {
      console.error(`Failed to update leaderboard message:`, error);
    }
  }
}
