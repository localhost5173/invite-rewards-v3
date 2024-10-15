import {
  EmbedBuilder,
  PartialGroupDMChannel,
  type GuildMember,
  type Invite,
  type TextBasedChannel,
  type User,
} from "discord.js";
import {
  getInviteData,
  InviteDataEntry,
  getTotalInvitesForUser,
  getSplitInvitesForUser,
  incrementRealInvites,
  saveInviteUsage,
} from "../../firebase/invites.js";
import { devMode } from "../../index.js";
import {
  getWelcomeChannelData,
  sendMessageToInfoChannel,
} from "../../firebase/channels.js";
import handleRewards from "../../utils/rewards/handleRewards.js";
import updateAllTimeLeaderboard from "../../utils/leaderboards/updateAllTimeLeaderboard.js";
import updateTimedLeaderboards from "../../utils/leaderboards/updateTimedLeaderboards.js";
import updateSmartLeaderboards from "../../utils/leaderboards/updateSmartLeaderboards.js";
import { getAndStoreInvites } from "../../events/ready/fetch-all-invites.js";

export async function addInvitesOnJoin(guildMember: GuildMember) {
  if (guildMember.user.bot) return; // Ignore bot accounts
  if (!isRealUser(guildMember)) {
    return;
  } // Ignore accounts less than 7 days old

  try {
    const guildId = guildMember.guild.id; // Get the guild ID
    const currentInvites = await guildMember.guild.invites.fetch(); // Fetch current invites from Discord

    // Create a plain JSON object to store invite data by invite code
    const inviteData: { [inviteCode: string]: InviteDataEntry } =
      (await getInviteData(guildId)) || {};

    if (!inviteData && devMode) {
      devMode ?? console.log("No invites found in the database.");
      return;
    }

    let usedInvite: Invite | undefined;
    const vanityCode = guildMember.guild.vanityURLCode; // Check for vanity code

    // Compare current invites to the stored invites
    for (const invite of currentInvites.values()) {
      if (inviteData[invite.code as string]) {
        const oldInviteUses = inviteData[invite.code]?.uses ?? 0;
        if (invite.uses !== null && invite.uses > oldInviteUses) {
          usedInvite = invite; // Found the used invite
          break;
        }
      } else {
        devMode ?? console.log("No invites found in the database.");
      }
    }

    // Check if vanity invite was used
    if (vanityCode && usedInvite && usedInvite.code === vanityCode) {
      console.log("User joined using a vanity link!");
      await sendVanityWelcomeMessage(guildMember);
      return;
    }

    if (usedInvite) {
      const inviterId = usedInvite.inviter?.id || null; // Get inviter ID if available

      if (inviterId) {
        // Get current user invites from the database
        const previousInvites = await getTotalInvitesForUser(
          guildId,
          inviterId
        );
        incrementRealInvites(guildId, inviterId);
        const invites = await getTotalInvitesForUser(guildId, inviterId);

        // Record the used invite for the member
        await saveInviteUsage(
          guildId,
          guildMember.id,
          inviterId,
          usedInvite.code
        );

        try {
          const inviter = await guildMember.guild.members.fetch(inviterId);

          if (inviter) {
            await sendWelcomeMessage(guildMember, inviter.user);
            await getAndStoreInvites(guildMember.guild);
            await handleRewards(guildId, inviter.user, previousInvites);
            await updateAllTimeLeaderboard(guildId, inviterId);
            await updateTimedLeaderboards(guildId, inviterId, 1);
            await updateSmartLeaderboards(guildId);

            // Dummy welcome message
            if (devMode) {
              console.log(
                `${guildMember.user.tag} was invited by ${inviter.user.tag} who now has ${invites} invites.`
              );
            }
          }
        } catch {
          await sendUnableToFindInviterMessage(guildMember);
        }
      }
    } else {
      // Send message when no invite is found
      await sendUnableToFindInviterMessage(guildMember);
    }
  } catch (error: any) {
    try {
      if (error.code === 50013) {
        console.error(
          `Failed to process guildMemberAdd for ${guildMember.guild.name}: Missing permissions.`
        );
        return await sendMessageToInfoChannel(
          guildMember.guild.id,
          `Cannot view inviter for ${guildMember.displayName} Missing permissions. Make sure the bot has the "Manage Server" permission.`
        );
      } else if (error.code === 10007) {
        console.error(
          `Failed to process guildMemberAdd for guild:${guildMember.guild.name}, member:${guildMember.displayName}: Unknown member.`
        );
      } else {
        console.error(
          `Failed to process guildMemberAdd for ${guildMember.guild.name}:`,
          error
        );
      }
    } catch (error: any) {
      console.error(`Failed send error message for guildMemberAdd`, error);
    }
  }
}

// Function to send welcome message when vanity invite is used
async function sendVanityWelcomeMessage(guildMember: GuildMember) {
  const welcomeChannelData = await getWelcomeChannelData(guildMember.guild.id);
  if (!welcomeChannelData || !welcomeChannelData.channelId) return;

  const welcomeChannel = guildMember.guild.channels.cache.get(
    welcomeChannelData.channelId
  ) as TextBasedChannel;

  if (welcomeChannel instanceof PartialGroupDMChannel) return;

  welcomeChannel.send(`${guildMember.user.tag} joined using a vanity link.`);
}

// Function to send message when inviter is not found
async function sendUnableToFindInviterMessage(guildMember: GuildMember) {
  const welcomeChannelData = await getWelcomeChannelData(guildMember.guild.id);
  if (!welcomeChannelData || !welcomeChannelData.channelId) return;

  const welcomeChannel = guildMember.guild.channels.cache.get(
    welcomeChannelData.channelId
  ) as TextBasedChannel;

  if (welcomeChannel instanceof PartialGroupDMChannel) return;

  welcomeChannel.send(
    `I was unable to find the inviter for ${guildMember.user.tag}`
  );
}

// Function to send welcome message using DB message
async function sendWelcomeMessage(guildMember: GuildMember, inviter: User) {
  console.log("Sending welcome message");
  const welcomeChannelData = await getWelcomeChannelData(guildMember.guild.id);
  if (!welcomeChannelData || !welcomeChannelData.channelId) return;
  const welcomeChannelId = welcomeChannelData.channelId;
  const welcomeMessage = welcomeChannelData.message;
  const welcomeEmbedJson = welcomeChannelData.embed;

  if (!welcomeChannelId) return;
  const welcomeChannel = guildMember.guild.channels.cache.get(
    welcomeChannelId
  ) as TextBasedChannel;

  if (welcomeChannel instanceof PartialGroupDMChannel) return;

  const inviteData = await getSplitInvitesForUser(
    guildMember.guild.id,
    inviter.id
  );

  const placeholders = {
    "{mention-user}": `<@${guildMember.id}>`,
    "{username}": guildMember.user.username,
    "{user-tag}": guildMember.user.tag,
    "{server-name}": guildMember.guild.name,
    "{member-count}": guildMember.guild.memberCount.toString(),
    "{inviter-tag}": inviter.tag || "Unknown",
    "{inviter-real-count}": inviteData.real.toString(),
    "{inviter-fake-count}": inviteData.fake.toString(),
    "{inviter-count}": (inviteData.fake + inviteData.real).toString(),
  };

  const replacePlaceholders = (text: string) => {
    return Object.entries(placeholders).reduce((str, [key, value]) => {
      return str.replace(new RegExp(key, "g"), value);
    }, text);
  };

  if (welcomeEmbedJson) {
    const processedEmbedJson = JSON.parse(
      replacePlaceholders(JSON.stringify(welcomeEmbedJson))
    );
    const welcomeEmbed = new EmbedBuilder(processedEmbedJson);
    welcomeChannel.send({ embeds: [welcomeEmbed] });
  } else {
    const formattedWelcomeMessage = replacePlaceholders(welcomeMessage);
    welcomeChannel.send(formattedWelcomeMessage);
  }
}

function isRealUser(guildMember: GuildMember) {
  const threshold = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const accountAge = Date.now() - guildMember.user.createdTimestamp;
  return accountAge >= threshold;
}
