import { ChannelType, Guild } from "discord.js";
import { setAsEnded, setWinners } from "../../firebase/giveaways.js";
import { createGiveawayEmbed } from "../embeds/giveaways.js";
import { Timestamp } from "firebase-admin/firestore";

export async function endGiveaway(guild: Guild, giveaway: any) {
  try {
    // Send a message to the giveaway channel announcing the winner
    const channelId = giveaway.channelId;
    const messageId = giveaway.messageId;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;
    if (channel.type !== ChannelType.GuildText) return;

    const numberOfWinners = giveaway.winners;
    const entries = giveaway.entries;

    const winners = entries
      .sort(() => Math.random() - 0.5)
      .slice(0, numberOfWinners);

    const winnerMentions = winners
      .map((winner: string) => `<@${winner}>`)
      .join(", ");

    // Send a message to the giveaway channel announcing the winner
    try {
      const message = await channel.messages.fetch(messageId);
      if (!message) return;

      if (winners.length === 0) {
        await message.reply(
          `No one entered the giveaway for ${giveaway.prize}.`
        );
      } else {
        await message.reply(
          `Congratulations ${winnerMentions}! You have won the giveaway for ${giveaway.prize}!`
        );
      }

      // Update the giveaway embed to show that it has ended
      await message.edit({
        embeds: [
          createGiveawayEmbed(
            giveaway.prize, // Prize string
            giveaway.description, // Correct: Now this is the description
            giveaway.winners, // Number of winners
            (giveaway.endTime as Timestamp).toDate(),
            giveaway.hostId,
            giveaway.giveawayId.toString(), // Ensure giveawayId is a string
            giveaway.entries.length, // Number of entries
            giveaway.inviteRequirement, // Invite requirement
            giveaway.rewardRoleId, // Reward role ID
            true,
            winners // This is correct if it's a string array
          ),
        ],
      });
    } catch (error) {
      if (winners.length === 0) {
        await channel.send(
          `No one entered the giveaway for ${giveaway.prize}.`
        );
      } else {
        await channel.send(
          `Congratulations ${winnerMentions}! You have won the giveaway for ${giveaway.prize}!`
        );
      }
    }

    // Give role reward if present
    const roleId = giveaway.rewardRoleId;
    if (roleId) {
      const role = guild.roles.cache.get(roleId);
      if (role) {
        winners.forEach(async (winner: string) => {
          const member = await guild.members.fetch(winner);
          member.roles.add(roleId);
        });
      }
    }

    // Add the winners to the giveaway in Firestore
    await setWinners(guild.id, giveaway.giveawayId.toString(), winners);

    // Update the giveaway in Firestore to mark it as ended
    await setAsEnded(guild.id, giveaway.giveawayId.toString());
  } catch (error: any) {
    if (error.code === 10008) {
    } else if (error.code === 50035) {
    } else {
      console.error(error);
    }
  }
}
