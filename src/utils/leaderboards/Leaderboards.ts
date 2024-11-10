import { TextChannel } from "discord.js";
import { client } from "../..";
import { cs } from "../console/customConsole";
import { db } from "../db/db";
import { Embeds } from "../embeds/embeds";

export class Leaderboards {
  static async updateLeaderboards(guildId: string, userId: string) {
    try {
      const newInviteCount =
        await db.invites.userInvites.getRealAndBonusInvites(guildId, userId);

      // Track if any leaderboard type has changed
      let top10Changed = false;

      // Update each leaderboard type
      top10Changed =
        (await updateLeaderboard(guildId, userId, newInviteCount, "daily")) ||
        top10Changed;
      top10Changed =
        (await updateLeaderboard(guildId, userId, newInviteCount, "weekly")) ||
        top10Changed;
      top10Changed =
        (await updateLeaderboard(guildId, userId, newInviteCount, "monthly")) ||
        top10Changed;
      top10Changed =
        (await updateLeaderboard(guildId, userId, newInviteCount, "alltime")) ||
        top10Changed;

      // Update smart leaderboards if any top 10 has changed
      if (top10Changed) {
        await updateSmartLeaderboards(guildId);
      }
    } catch (error) {
      cs.error("Error while updating leaderboards: " + error);
    }
  }

  static async formatLeaderboardMessage(
    guildId: string,
    entries: { position: number; user: string; invites: number }[]
  ): Promise<string> {
    let message = "";

    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`);

    const invitesTranslation = languageData.leaderboards.update.invitesTranslation;

    entries.forEach((entry) => {
      message += `${entry.position}. ${entry.user} - ${entry.invites} ${invitesTranslation}\n`;
    });

    return message;
  }
}

async function updateLeaderboard(
  guildId: string,
  userId: string,
  inviteCount: number,
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime"
): Promise<boolean> {
  // Retrieve current top 25 entries
  const topEntries = await db.leaderboards.getTopEntries(
    guildId,
    leaderboardType
  );

  cs.log("Invite count: " + inviteCount);
  // Delete user's entry if they have no invites
  if (inviteCount <= 0) {
    cs.log("Deleting user entry");
    await db.leaderboards.deleteUserEntry(guildId, userId, leaderboardType);
  }

  // Check if user qualifies for the top 25
  const qualifiesForTop25 =
    topEntries.length < 25 ||
    inviteCount > topEntries[topEntries.length - 1].inviteCount;

  if (qualifiesForTop25) {
    // Upsert user's invite count in the top 25
    await db.leaderboards.updateEntry(
      guildId,
      userId,
      leaderboardType,
      inviteCount
    );

    // If more than 25 entries, trim the lowest one
    if (topEntries.length >= 25) {
      await db.leaderboards.deleteLowestEntry(guildId, leaderboardType);
    }
  } else {
    // If user doesn't qualify, ensure they aren't in the leaderboard
    await db.leaderboards.deleteUserEntry(guildId, userId, leaderboardType);
  }

  await db.leaderboards.deleteNegative(guildId, leaderboardType);

  // Check if the top 10 has changed
  const newTopEntries = await db.leaderboards.getTopEntries(
    guildId,
    leaderboardType
  );
  const top10Changed = hasTop10Changed(topEntries, newTopEntries);

  return top10Changed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasTop10Changed(oldEntries: any[], newEntries: any[]): boolean {
  for (let i = 0; i < 10; i++) {
    if (oldEntries[i]?.userId !== newEntries[i]?.userId) {
      return true;
    }
    if (oldEntries[i]?.inviteCount !== newEntries[i]?.inviteCount) {
      return true;
    }
  }
  return false;
}

async function updateSmartLeaderboards(guildId: string) {
  const smartLeaderboards = await db.leaderboards.getSmart(guildId);

  if (smartLeaderboards.length === 0) {
    cs.dev("No smart leaderboards found.");
    return;
  }

  for (const smartLeaderboard of smartLeaderboards) {
    const leaderboard = await db.leaderboards.getLeaderboard(
      guildId,
      smartLeaderboard.leaderboardType
    );

    cs.log("LEaderbopards: " + leaderboard);

    const channelId = smartLeaderboard.channelId;
    const messageId = smartLeaderboard.messageId;
    const leaderboardGuildId = smartLeaderboard.guildId;

    const entries = leaderboard.map((entry, index) => {
      return {
        position: index + 1,
        user: `<@${entry.userId}>`,
        invites: entry.inviteCount,
      };
    });

    const leaderboardMessage = await Leaderboards.formatLeaderboardMessage(guildId, entries);

    const embed = await Embeds.createEmbed(
      guildId,
      `leaderboards.smart.${smartLeaderboard.leaderboardType}`,
      {
        leaderboard: leaderboardMessage,
      }
    );

    const guild = client.guilds.cache.get(leaderboardGuildId);
    if (!guild) {
      await db.leaderboards.deleteSmart(guildId, channelId, messageId);
      cs.dev("Leaderboard guild not found, deleting smart leaderboard.");
      continue;
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !(channel instanceof TextChannel)) {
      await db.leaderboards.deleteSmart(guildId, channelId, messageId);
      cs.dev("Leaderboard channel not found, deleting smart leaderboard.");
      continue;
    }

    const message = await channel.messages.fetch(messageId).catch(() => null);

    if (!message) {
      await db.leaderboards.deleteSmart(guildId, channelId, messageId);
      cs.dev("Leaderboard message not found, deleting smart leaderboard.");
      continue;
    }

    await message.edit({ embeds: [embed] });
  }
}
