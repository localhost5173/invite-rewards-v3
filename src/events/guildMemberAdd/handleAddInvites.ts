import { GuildMember, Invite } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function (guildMember: GuildMember) {
  try {
    if (guildMember.user.bot) return;
    if (!isRealUser(guildMember)) return;
    const { guild } = guildMember;
    const currentInvites = await guild.invites.fetch();
    const dbInvites = await db.invites.inviteEntries.getEntriesForGuild(
      guild.id
    );

    let usedInvite: Invite | undefined;
    const vanityCode = guildMember.guild.vanityURLCode; // Check for vanity code

    // Compare current invites to the stored invites
    for (const invite of currentInvites.values()) {
      const dbInvite = dbInvites.find((entry) => entry.code === invite.code);
      if (dbInvite) {
        const oldInviteUses = dbInvite.uses ?? 0;
        if (invite.uses !== null && invite.uses > oldInviteUses) {
          usedInvite = invite; // Found the used invite
          break;
        }
      }
    }

    if (vanityCode && usedInvite && usedInvite.code === vanityCode) {
      cs.dev("User joined using a vanity link!");
      return;
    }

    if (usedInvite) {
      const inviter = usedInvite.inviter;

      await db.invites.usedInvites.addEntry(
        guild.id,
        inviter?.id,
        usedInvite?.code,
        guildMember.id
      );

      if (inviter) {
        // Trycatch becayse inviterMember throws an error if the inviter is not in the guild
        try {
          const inviterMember = await guild.members.fetch(inviter.id);
          cs.dev("Inviter found: " + inviterMember.user.tag);

          await sendWelcomeMessage(guildMember, inviterMember);
          await db.invites.joinedUsers.addEntry(guild.id, inviter.id, guildMember.id);
          await db.invites.userInvites.addReal(guild.id, inviter.id);
          await db.invites.inviteEntries.addUse(guild.id, usedInvite.code);
        } catch {
          cs.dev("Inviter member not found.");
        }
      } else {
        cs.dev("Inviter id not found.");
      }
    }
  } catch (error: unknown) {
    cs.error("errror in handleAddInvites.ts: " + error);
  }
}

function isRealUser(guildMember: GuildMember) {
  const threshold = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const accountAge = Date.now() - guildMember.user.createdTimestamp;
  return accountAge >= threshold;
}

function sendWelcomeMessage(guildMember: GuildMember, inviter: GuildMember) {
  try {
    cs.warn("Sending proper welcome message not implemented yet.");
    const welcomeMessage = `Welcome to the server, ${guildMember.user.tag}! You were invited by ${inviter.user.tag}.`;
    return guildMember.send(welcomeMessage);
  } catch (error: unknown) {
    cs.error("Error in sendWelcomeMessage: " + error);
  }
}
