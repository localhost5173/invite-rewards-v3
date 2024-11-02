import { GuildMember } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";

export default async function (guildMember: GuildMember) {
  const guildId = guildMember.guild.id;

  try {
    const welcomerSettings = await db.welcomer.getWelcomerSettings(guildId);
    if (!welcomerSettings) return;

    const welcomeChannelId = welcomerSettings.server.welcomeChannelId;
    const serverWelcomeMessage = welcomerSettings.server.welcomeMessage;
    const dmWelcomeMessage = welcomerSettings.dm.welcomeMessage;

    const inviterId = await db.invites.joinedUsers.getInviterOfUser(
      guildId,
      guildMember.id
    );

    // Get the inviter
    let inviter: GuildMember | null = null;
    try {
      if (inviterId) {
        inviter = await guildMember.guild.members.fetch(inviterId);
      }
    } catch {
      inviter = null;
    }

    // Get the inviter's invites
    let inviterInvites;
    if (inviter) {
      inviterInvites = await db.invites.userInvites.getInvites(
        guildId,
        inviter.id
      );
    }



    if (welcomeChannelId && serverWelcomeMessage) {
      const welcomeChannel =
        guildMember.guild.channels.cache.get(welcomeChannelId);

      if (welcomeChannel && welcomeChannel.isTextBased()) {
        await welcomeChannel.send(
          replacePlaceholders(
            serverWelcomeMessage,
            guildMember,
            inviter,
            inviterInvites
          )
        );
      } else {
        cs.error(`Welcome channel not found for guild: ${guildId}`);
      }
    }
  } catch (error) {
    cs.error(`Error while sending welcome message: ` + error);
  }
}

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