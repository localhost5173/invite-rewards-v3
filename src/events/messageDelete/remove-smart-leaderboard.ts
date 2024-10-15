import { Message } from "discord.js";
import { isSmartLeaderboardMessage, removeSmartLeaderboard } from "../../firebase/leaderboards.js";
import { devMode } from "../../index.js";

export default async function (message : Message) {
    devMode ?? console.log(`Message ${message.id} was deleted in guild ${message.guild?.id}.`);
    if (!message.guild || !message.author.bot) {
        return
    }

    try {
      // Check if the deleted message was associated with a smart leaderboard
      const isLeaderboardMessage = await isSmartLeaderboardMessage(
        message.guild.id,
        message.id
      );

      // If it was a leaderboard message, remove it from the DB
      if (isLeaderboardMessage) {
        await removeSmartLeaderboard(message.guild.id, message.id);
        devMode ?? console.log(
          `Smart leaderboard associated with message ${message.id} in guild ${message.guild.id} has been removed.`
        );
      }
    } catch (error) {
      console.error(
        `Failed to process leaderboard removal for message ${message.id}:`,
        error
      );
    }
}