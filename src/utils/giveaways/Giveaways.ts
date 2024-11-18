import { TextBasedChannel, TextChannel } from "discord.js";
import { client } from "../..";
import { db } from "../db/db";
import { GiveawayDocument } from "../db/models/giveaway";
import { cs } from "../console/customConsole";
import { GiveawayEmbedBuilder } from "./GiveawayEmbedBuilder";

export class Giveaways {
  static async canUserEnterGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
    if (!giveaway) return false;
    if (giveaway.ended) return false;

    const userInvites = await db.invites.userInvites.getRealAndBonusInvites(
      guildId,
      userId,
      "alltime"
    );

    if (!giveaway.inviteRequirement) return true;
    if (giveaway.inviteRequirement > userInvites) return false;

    return true;
  }

  static async rerollWinners(guildId: string, giveawayId: number) {
    const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
    if (!giveaway) return;

    const winners: string[] = [];
    const entries = [...giveaway.entries]; // Create a copy of the entries array

    // Ensure winners don't exceed the number of entries
    const numberOfWinners = Math.min(
      giveaway.numberOfWinners,
      entries.length
    );

    for (let i = 0; i < numberOfWinners; i++) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      const winner = entries.splice(randomIndex, 1)[0]; // Remove the selected winner from the entries array
      winners.push(winner);
    }

    // Mark giveaway as ended and save winners
    await db.giveaways.setWinners(guildId, giveawayId, winners);

    // Announce winners
    await announceWinners(giveaway, winners, true);
  }

  static async isEnteredGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
    if (!giveaway) return false;

    return giveaway.entries.includes(userId);
  }

  static async enterGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    await db.giveaways.enterGiveaway(guildId, giveawayId, userId);
  }

  static async leaveGiveaway(
    guildId: string,
    giveawayId: number,
    userId: string
  ) {
    await db.giveaways.leaveGiveaway(guildId, giveawayId, userId);
  }

  static async updateEmbedEntries(guildId: string, giveawayId: number) {
    const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
    if (!giveaway) return;

    const guild =
      client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));
    const channel = (guild.channels.cache.get(giveaway.channelId) ||
      (await guild.channels.fetch(giveaway.channelId))) as TextBasedChannel;
    if (!channel) return;

    const message = await channel.messages.fetch(giveaway.messageId);

    // Prepare replacement data
    const endTimeUnix = Math.floor(giveaway.endTime.getTime() / 1000);
    const replacements = {
      description: giveaway.description,
      prize: giveaway.prize,
      host: `<@${giveaway.hostId}>`,
      timeLeft: `<t:${endTimeUnix}:R> <t:${endTimeUnix}:F>`,
      giveawayId: giveawayId.toString(),
      entries: giveaway.entries.length.toString(),
      numberOfWinners: giveaway.numberOfWinners.toString(),
    };

    // Build the embed
    const embed = await GiveawayEmbedBuilder.build(
      guildId,
      "giveawayNotEnded",
      replacements
    );

    // Add fields dynamically
    if (giveaway.rewardRoleId) {
      const rewardRole =
        guild.roles.cache.get(giveaway.rewardRoleId) ||
        (await guild.roles.fetch(giveaway.rewardRoleId));
      if (rewardRole) {
        embed.addFields({
          name: "Reward Role",
          value: `<@&${rewardRole.id}>`,
          inline: true,
        });
      }
    }

    if (giveaway.inviteRequirement) {
      embed.addFields({
        name: "Invite Requirement",
        value: giveaway.inviteRequirement.toString(),
        inline: true,
      });
    }

    await message.edit({ embeds: [embed] });
  }

  static async checkForEndedGiveaways() {
    const giveawaysToEnd = await db.giveaways.getGiveawaysToEnd();

    for (const giveaway of giveawaysToEnd) {
      cs.dev("Ending giveaway: " + giveaway.giveawayId);

      const winners: string[] = [];
      const entries = [...giveaway.entries]; // Create a copy of the entries array

      // Ensure winners don't exceed the number of entries
      const numberOfWinners = Math.min(
        giveaway.numberOfWinners,
        entries.length
      );

      for (let i = 0; i < numberOfWinners; i++) {
        const randomIndex = Math.floor(Math.random() * entries.length);
        const winner = entries.splice(randomIndex, 1)[0]; // Remove the selected winner from the entries array
        winners.push(winner);
      }

      // Mark giveaway as ended and save winners
      await db.giveaways.setAsEnded(giveaway.guildId, giveaway.giveawayId);
      await db.giveaways.setWinners(
        giveaway.guildId,
        giveaway.giveawayId,
        winners
      );

      // Announce winners
      await announceWinners(giveaway, winners);
    }
  }
}

async function announceWinners(giveaway: GiveawayDocument, winners: string[], reroll = false) {
  cs.log(winners);

  const guild =
    client.guilds.cache.get(giveaway.guildId) ||
    (await client.guilds.fetch(giveaway.guildId));

  const channel = (guild.channels.cache.get(giveaway.channelId) ||
    (await guild.channels.fetch(giveaway.channelId))) as TextBasedChannel;

  if (!channel) return;
  const message = await channel.messages.fetch(giveaway.messageId);

  const endTimeUnix = Math.floor(giveaway.endTime.getTime() / 1000);

  const winnersString =
    winners.map((winner) => `<@${winner}>`).join(", ") || "No winners";

  const replacements = {
    description: giveaway.description,
    prize: giveaway.prize,
    host: `<@${giveaway.hostId}>`,
    endedTimestamp: `<t:${endTimeUnix}:R> <t:${endTimeUnix}:F>`,
    entries: giveaway.entries.length.toString(),
    giveawayId: giveaway.giveawayId.toString(),
    winners: winnersString,
  };

  const embed = await GiveawayEmbedBuilder.build(
    giveaway.guildId,
    "giveawayEnded",
    replacements
  );

  if (giveaway.rewardRoleId) {
    const rewardRole =
      guild.roles.cache.get(giveaway.rewardRoleId) ||
      (await guild.roles.fetch(giveaway.rewardRoleId));
    if (rewardRole) {
      embed.addFields({
        name: "Reward Role",
        value: `<@&${rewardRole.id}>`,
        inline: true,
      });
    }
  }

  if (giveaway.inviteRequirement) {
    embed.addFields({
      name: "Invite Requirement",
      value: giveaway.inviteRequirement.toString(),
      inline: true,
    });
  }

  await message.edit({ embeds: [embed] });

  const mentionWinners = winners.map((winner) => `<@${winner}>`).join(", ");

  if (winners.length !== 0 && !reroll
  ) {
    await (channel as TextChannel).send({
      content: `${mentionWinners} Congratulations! You won the giveaway for **${giveaway.prize}**!`,
    });
  }

  if (winners.length !== 0 && reroll) {
    await (channel as TextChannel).send({
      content: `${mentionWinners} Congratulations! You won the rerolled giveaway for **${giveaway.prize}**!`,
    });
  }
}