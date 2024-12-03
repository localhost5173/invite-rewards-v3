import { Message } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

export default async function (message: Message) {
  const guildId = message.guild?.id;
  if (!guildId || !message.author.bot) return;

  try {
    const isSmartLeaderboardMessage =
      await db.leaderboards.isSmartLeaderboardMessage(
        guildId,
        message.channel.id,
        message.id
      );

    if (isSmartLeaderboardMessage) {
      cs.dev("Deleting smart leaderboard upon messageDelete.");
      await db.leaderboards.deleteSmart(
        guildId,
        message.channel.id,
        message.id
      );
    }
  } catch (error) {
    console.error(
      "Error while deleting smart leaderboard upon messageDelete: " + error
    );
  }
}
