import { EmbedBuilder } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };

export function createGiveawayEmbed(
  prize: string,
  description: string,
  numberOfWinners: number,
  endTime: Date,
  hostId: string,
  giveawayId: number,
  entries: number,
  inviteRequirement: number,
  rewardRoleId?: string,
  ended?: boolean,
  winners?: string[]
) {
  // Convert endTime to Unix timestamp (in seconds)
  const endTimeUnix = Math.floor(endTime.getTime() / 1000);

  const field = {
    name: "\u200b", // Single field for all data
    value:
      `${ended ? "Ended" : "Ends"
      }: <t:${endTimeUnix}:R> <t:${endTimeUnix}:F>\n` +
      `Hosted by: **<@${hostId}>**\n` +
      `Entries: **${entries.toLocaleString()}**\n` +
      `Winners: **${numberOfWinners}**` +
      (inviteRequirement
        ? `\nInvite Requirement: **${inviteRequirement} invites**`
        : "") +
      (rewardRoleId ? `\nRole for winnners: <@&${rewardRoleId}>` : "") +
      (ended ? "\nStatus: **Giveaway Ended! 🚫**" : "") +
      (winners && winners.length > 0
        ? `\nWinner(s): ${winners.map((winner) => `<@${winner}>`).join(", ")}`
        : "\nWinner(s): None"),
    inline: false,
  }

  const embed = new EmbedBuilder()
    .setTitle(`**${prize}**`)
    .setDescription(`**${description}**`)
    .addFields(field)
    .setColor(0x5865f2) // Solid blue color
    .setTimestamp()
    .setFooter({
      text: `Giveaway ID: ${giveawayId}`,
      iconURL: botconfig.logo,
    });

  return embed;
}
