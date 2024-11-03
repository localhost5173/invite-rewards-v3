import { GuildMember, Invite, TextChannel } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function (guildMember: GuildMember) {
  try {
    if (guildMember.user.bot) return;

    const { guild } = guildMember;
    const currentInvites = await guild.invites.fetch();
    const dbInvites = await db.invites.inviteEntries.getEntriesForGuild(
      guild.id
    );
    const isVerificationEnabled = await db.verification.isEnabled(guild.id);

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
      await sendWelcomeMessage(guildMember, null, true);
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
        // Trycatch because inviterMember throws an error if the inviter is not in the guild
        try {
          const inviterMember = await guild.members.fetch(inviter.id);
          cs.dev("Inviter found: " + inviterMember.user.tag);

          await sendWelcomeMessage(guildMember, inviterMember, false);

          // Set verified to false if verification is enabled
          if (isVerificationEnabled) {
            await db.invites.joinedUsers.addEntry(
              guild.id,
              inviter.id,
              guildMember.id,
              false,
              !isRealUser(guildMember)
            );
          } else {
            await db.invites.joinedUsers.addEntry(
              guild.id,
              inviter.id,
              guildMember.id,
              true,
              !isRealUser(guildMember)
            );
          }

          if (isRealUser(guildMember)) {
            if (isVerificationEnabled) {
              await db.invites.userInvites.addUnverified(guild.id, inviter.id);
            } else {
              await db.invites.userInvites.addReal(guild.id, inviter.id);
            }
          } else {
            // Need to add a case for verification
            await db.invites.userInvites.addFake(guild.id, inviter.id);
          }

          await db.invites.inviteEntries.addUse(guild.id, usedInvite.code);
        } catch {
          cs.dev("Inviter member not found.");
        }
      } else {
        cs.dev("Inviter id not found.");
        await sendWelcomeMessage(guildMember, null, false);
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

async function sendWelcomeMessage(
  guildMember: GuildMember,
  inviter: GuildMember | null,
  vanity: boolean
) {
  const guildId = guildMember.guild.id;

  try {
    // Fetch welcomer settings from the database
    const welcomerSettings = await db.welcomer.getWelcomerSettings(guildId);
    if (!welcomerSettings) return;

    const { server, dm } = welcomerSettings;
    const {
      welcomeChannelId,
      welcomeMessage: serverWelcomeMessage,
      welcomeVanityMessage,
    } = server;
    const { welcomeMessage: dmWelcomeMessage } = dm;

    // Fetch inviter's invites
    const inviterInvites = inviter
      ? await db.invites.userInvites.getInvites(guildId, inviter.id)
      : null;

    // Send welcome message to the server channel if it exists
    if (welcomeChannelId) {
      const welcomeChannel = guildMember.guild.channels.cache.get(
        welcomeChannelId
      ) as TextChannel;

      if (welcomeChannel && welcomeChannel.isTextBased()) {
        let welcomeMessage = serverWelcomeMessage;

        // Use vanity welcome message if vanity is true and the message exists
        if (vanity && welcomeVanityMessage) {
          welcomeMessage = welcomeVanityMessage;
        }

        if (welcomeMessage) {
          const finalWelcomeMessage = replacePlaceholders(
            welcomeMessage,
            guildMember,
            inviter,
            inviterInvites
          );
          await sendServerWelcomeMessage(welcomeChannel, finalWelcomeMessage);
        }
      } else {
        cs.error(
          `Welcome channel not found or not text-based for guild: ${guildId}`
        );
      }
    }

    // Send welcome message to the user's DM if it exists
    if (dmWelcomeMessage) {
      const finalDmWelcomeMessage = replacePlaceholders(
        dmWelcomeMessage,
        guildMember,
        inviter,
        inviterInvites
      );
      await sendDmWelcomeMessage(guildMember, finalDmWelcomeMessage);
    }
  } catch (error) {
    cs.error(`Error while sending welcome message: ${error}`);
  }
}

/**
 * Replaces placeholders in the welcome message with actual values.
 */
function replacePlaceholders(
  message: string,
  guildMember: GuildMember,
  inviter: GuildMember | null,
  inviterInvites:
    | {
        real: number;
        bonus: number;
        fake: number;
        unverified: number;
      }
    | null
    | undefined
) {
  const inviterCount =
    (inviterInvites?.real ?? 0) + (inviterInvites?.bonus ?? 0);
  return message
    .replace("{mention-user}", `<@${guildMember.id}>`)
    .replace("{username}", guildMember.user.username)
    .replace("{user-tag}", guildMember.user.tag)
    .replace("{server-name}", guildMember.guild.name)
    .replace("{member-count}", guildMember.guild.memberCount.toString())
    .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
    .replace("{inviter-count}", inviterCount.toString() || "0")
    .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
    .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0");
}

/**
 * Sends a welcome message to the user's DM.
 */
async function sendDmWelcomeMessage(
  guildMember: GuildMember,
  dmWelcomeMessage: string
) {
  try {
    await guildMember.send(dmWelcomeMessage);
  } catch (error) {
    cs.error(`Error while sending DM welcome message: ${error}`);
  }
}

async function sendServerWelcomeMessage(
  welcomeChannel: TextChannel,
  serverWelcomeMessage: string
) {
  try {
    await welcomeChannel.send(serverWelcomeMessage);
  } catch (error) {
    cs.error(`Error while sending server welcome message: ${error}`);
  }
}
