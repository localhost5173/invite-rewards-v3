import {
  EmbedBuilder,
  PartialGroupDMChannel,
  PartialGuildMember,
  TextBasedChannel,
  type GuildMember,
  type User,
} from "discord.js";
import { devMode } from "../../index.js";
import {
  decrementRealInvites,
  getInviterForUser,
  getSplitInvitesForUser,
  getTotalInvitesForUser,
  removeUserFromUsedInvites,
} from "../../firebase/invites.js";
import { getLeaveChannelData } from "../../firebase/channels.js";
import handleRewards from "../../utils/rewards/handleRewards.js";
import updateTimedLeaderboards from "../../utils/leaderboards/updateTimedLeaderboards.js";
import updateAllTimeLeaderboard from "../../utils/leaderboards/updateAllTimeLeaderboard.js";

export default async function (guildMember: GuildMember | PartialGuildMember) {
  console.log("Bye")
  if (guildMember.user.bot) return; // Ignore bot accounts

  const guildId = guildMember.guild.id;
  try {
    // Remove the user from the usedBy array in the used-invites collection
    const inviterId = await getInviterForUser(guildId, guildMember.user.id);
    console.log("InviterId: " + inviterId)

    if (inviterId) {
      // Remove the user from the usedBy array
      const previousInvites = await getTotalInvitesForUser(guildId, inviterId);
      await decrementRealInvites(guildId, inviterId);
      await removeUserFromUsedInvites(guildId, guildMember.user.id);

      try {
        const inviter = await guildMember.guild.members.fetch(inviterId);
        await sendGoodbyeMessage(guildMember, inviter.user);
        await handleRewards(guildId, inviter.user, previousInvites);
        // Handle inviter not being persent in the guild
      } catch (error) {
        console.log("Inviter not found in the guild.");
        await sendNoInviterGoodbyeMessage(guildMember);
      }
      await updateAllTimeLeaderboard(guildId, inviterId);
      await updateTimedLeaderboards(guildId, inviterId, -1);

      devMode ??
        console.log(
          `${guildMember.user.tag} left, they were invited by ${inviterId}.`
        );
    }
  } catch (error) {
    console.error(
      `Failed to process guildMemberRemove for ${guildMember.guild.name}:`,
      error
    );
  }
}

async function sendGoodbyeMessage(
  guildMember: GuildMember | PartialGuildMember,
  inviter: User
) {
  const leaveChannelData = await getLeaveChannelData(guildMember.guild.id);

  if (!leaveChannelData) return;
  const leaveChannelId = leaveChannelData.channelId;
  const goodbyeMessage = leaveChannelData.message;
  const goodbyeEmbedJson = leaveChannelData.embed;
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
    "{inviter-tag}": inviter.tag || "Unknown inviter",
    "{inviter-real-count}": inviteData.real.toString(),
    "{inviter-fake-count}": inviteData.fake.toString(),
    "{inviter-count}": (inviteData.fake + inviteData.real).toString(),
  };

  const replacePlaceholders = (text: string) => {
    return Object.entries(placeholders).reduce((str, [key, value]) => {
      return str.replace(new RegExp(key, "g"), value);
    }, text);
  };

  if (!leaveChannelId) return;
  const leaveChannel = guildMember.guild.channels.cache.get(
    leaveChannelId
  ) as TextBasedChannel;

  if (leaveChannel instanceof PartialGroupDMChannel) {
    return;
  }

  if (goodbyeEmbedJson) {
    const processedEmbedJson = JSON.parse(
      replacePlaceholders(JSON.stringify(goodbyeEmbedJson))
    );
    const goodbyeEmbed = new EmbedBuilder(processedEmbedJson);
    leaveChannel.send({ embeds: [goodbyeEmbed] });
  } else {
    const formattedGoodbyeMessage = replacePlaceholders(goodbyeMessage);
    leaveChannel?.send(formattedGoodbyeMessage);
  }
}

async function sendNoInviterGoodbyeMessage(
  guildMember: GuildMember | PartialGuildMember
) {
  const leaveChannelData = await getLeaveChannelData(guildMember.guild.id);

  if (!leaveChannelData) return;
  const leaveChannelId = leaveChannelData.channelId;
  const goodbyeMessage = leaveChannelData.message;
  const goodbyeEmbedJson = leaveChannelData.embed;

  const placeholders = {
    "{mention-user}": `<@${guildMember.id}>`,
    "{username}": guildMember.user.username,
    "{user-tag}": guildMember.user.tag,
    "{server-name}": guildMember.guild.name,
    "{member-count}": guildMember.guild.memberCount.toString(),
    "{inviter-tag}": "Unknown",
    "{inviter-real-count}": "Unknown",
    "{inviter-fake-count}": "Unknown",
    "{inviter-count}": "Unknown",
  };

  const replacePlaceholders = (text: string) => {
    return Object.entries(placeholders).reduce((str, [key, value]) => {
      return str.replace(new RegExp(key, "g"), value);
    }, text);
  };

  if (!leaveChannelId) return;
  const leaveChannel = guildMember.guild.channels.cache.get(
    leaveChannelId
  ) as TextBasedChannel;

  if (leaveChannel instanceof PartialGroupDMChannel) {
    return;
  }

  if (goodbyeEmbedJson) {
    const processedEmbedJson = JSON.parse(
      replacePlaceholders(JSON.stringify(goodbyeEmbedJson))
    );
    const goodbyeEmbed = new EmbedBuilder(processedEmbedJson);
    leaveChannel.send({ embeds: [goodbyeEmbed] });
  } else {
    const formattedGoodbyeMessage = replacePlaceholders(goodbyeMessage);
    leaveChannel?.send(formattedGoodbyeMessage);
  }
}