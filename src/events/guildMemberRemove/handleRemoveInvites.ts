import { GuildMember, TextChannel, EmbedBuilder, APIEmbed } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Leaderboards } from "../../utils/leaderboards/Leaderboards.js";
import { Rewards } from "../../utils/rewards/Rewards.js";

export default async function (guildMember: GuildMember) {
  try {
    const guildId = guildMember.guild.id;

    const joinedUser = await db.invites.joinedUsers.getJoinedUser(
      guildId,
      guildMember.id
    );

    const inviterId = joinedUser?.inviterId;

    cs.dev("InviterId: " + inviterId);

    if (inviterId) {
      const isUserVerified = joinedUser?.isVerified;
      const isUserFake = joinedUser?.isFake;

      // Decrement the invite count of the inviter
      if (isUserVerified) {
        // Remove real invite from inviter if the user is verified
        await db.invites.userInvites.decrementReal(guildId, inviterId);
        await Leaderboards.updateLeaderboards(guildId, inviterId);
        await Rewards.handleGiveRewards(guildId, inviterId);
      } else {
        if (isUserFake) {
          await db.invites.userInvites.decrementFake(guildId, inviterId);
        } else {
          await db.invites.userInvites.decrementUnverified(guildId, inviterId);
        }
      }

      await db.invites.usedInvites.removeUserFromUsedBy(
        guildId,
        guildMember.id
      );
      await db.invites.joinedUsers.setLeftAt(guildId, guildMember.id);
    }

    cs.dev(
      `User ${guildMember.user.tag} left the server. Inviter: ${
        inviterId
          ? guildMember.guild.members.cache.get(inviterId)?.user.tag
          : "Unknown"
      }`
    );

    let inviter;
    if (inviterId) {
      inviter = guildMember.guild.members.cache.get(inviterId) ?? null;
    } else {
      inviter = null;
    }

    // Send farewell message
    await sendFarewellMessage(guildMember, inviter, !inviterId);
  } catch (error: unknown) {
    cs.error("Error while handling guildMemberRemove event: " + error);
  }
}

async function sendFarewellMessage(
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
      farewellChannelId,
      farewellMessage: serverFarewellMessage,
      farewellVanityMessage,
      farewellEmbed: serverFarewellEmbed,
    } = server;
    const {
      farewellMessage: dmFarewellMessage,
      farewellEmbed: dmFarewellEmbed,
    } = dm;

    // Fetch inviter's invites
    const inviterInvites = inviter
      ? await db.invites.userInvites.getInvites(guildId, inviter.id)
      : null;

    // Send farewell message to the server channel if it exists
    if (farewellChannelId) {
      const farewellChannel = guildMember.guild.channels.cache.get(
        farewellChannelId
      ) as TextChannel;

      if (farewellChannel && farewellChannel.isTextBased()) {
        let farewellMessage = serverFarewellMessage;
        const farewellEmbed = serverFarewellEmbed;

        // Use vanity farewell message if vanity is true and the message exists
        if (vanity && farewellVanityMessage) {
          farewellMessage = farewellVanityMessage;
        }

        if (farewellEmbed) {
          const finalFarewellEmbed = replaceEmbedPlaceholders(
            farewellEmbed,
            guildMember,
            inviter,
            inviterInvites
          );
          await sendServerFarewellEmbed(farewellChannel, finalFarewellEmbed);
        } else if (farewellMessage) {
          const finalFarewellMessage = replacePlaceholders(
            farewellMessage,
            guildMember,
            inviter,
            inviterInvites
          );
          await sendServerFarewellMessage(
            farewellChannel,
            finalFarewellMessage
          );
        }
      } else {
        cs.error(
          `Farewell channel not found or not text-based for guild: ${guildId}`
        );
      }
    }

    // Send farewell message to the user's DM if it exists
    if (dmFarewellEmbed) {
      const finalDmFarewellEmbed = replaceEmbedPlaceholders(
        dmFarewellEmbed,
        guildMember,
        inviter,
        inviterInvites
      );
      await sendDmFarewellEmbed(guildMember, finalDmFarewellEmbed);
    } else if (dmFarewellMessage) {
      const finalDmFarewellMessage = replacePlaceholders(
        dmFarewellMessage,
        guildMember,
        inviter,
        inviterInvites
      );
      await sendDmFarewellMessage(guildMember, finalDmFarewellMessage);
    }
  } catch (error) {
    cs.error(`Error while sending farewell message: ${error}`);
  }
}

/**
 * Replaces placeholders in the farewell message with actual values.
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
 * Replaces placeholders in the embed with actual values.
 */
function replaceEmbedPlaceholders(
  embed: APIEmbed,
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
): EmbedBuilder {
  const inviterCount =
    (inviterInvites?.real ?? 0) + (inviterInvites?.bonus ?? 0);
  const embedBuilder = new EmbedBuilder(embed);

  if (embed.title) {
    embedBuilder.setTitle(
      embed.title
        .replace("{mention-user}", `<@${guildMember.id}>`)
        .replace("{username}", guildMember.user.username)
        .replace("{user-tag}", guildMember.user.tag)
        .replace("{server-name}", guildMember.guild.name)
        .replace("{member-count}", guildMember.guild.memberCount.toString())
        .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
        .replace("{inviter-count}", inviterCount.toString() || "0")
        .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
        .replace(
          "{inviter-bonus-count}",
          inviterInvites?.bonus.toString() || "0"
        )
    );
  }

  if (embed.description) {
    embedBuilder.setDescription(
      embed.description
        .replace("{mention-user}", `<@${guildMember.id}>`)
        .replace("{username}", guildMember.user.username)
        .replace("{user-tag}", guildMember.user.tag)
        .replace("{server-name}", guildMember.guild.name)
        .replace("{member-count}", guildMember.guild.memberCount.toString())
        .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
        .replace("{inviter-count}", inviterCount.toString() || "0")
        .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
        .replace(
          "{inviter-bonus-count}",
          inviterInvites?.bonus.toString() || "0"
        )
    );
  }

  if (embed.fields) {
    embedBuilder.setFields(
      embed.fields.map((field) => ({
        name: field.name
          .replace("{mention-user}", `<@${guildMember.id}>`)
          .replace("{username}", guildMember.user.username)
          .replace("{user-tag}", guildMember.user.tag)
          .replace("{server-name}", guildMember.guild.name)
          .replace("{member-count}", guildMember.guild.memberCount.toString())
          .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
          .replace("{inviter-count}", inviterCount.toString() || "0")
          .replace(
            "{inviter-real-count}",
            inviterInvites?.real.toString() || "0"
          )
          .replace(
            "{inviter-bonus-count}",
            inviterInvites?.bonus.toString() || "0"
          ),
        value: field.value
          .replace("{mention-user}", `<@${guildMember.id}>`)
          .replace("{username}", guildMember.user.username)
          .replace("{user-tag}", guildMember.user.tag)
          .replace("{server-name}", guildMember.guild.name)
          .replace("{member-count}", guildMember.guild.memberCount.toString())
          .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
          .replace("{inviter-count}", inviterCount.toString() || "0")
          .replace(
            "{inviter-real-count}",
            inviterInvites?.real.toString() || "0"
          )
          .replace(
            "{inviter-bonus-count}",
            inviterInvites?.bonus.toString() || "0"
          ),
        inline: field.inline,
      }))
    );
  }

  return embedBuilder;
}

/**
 * Sends a farewell message to the user's DM.
 */
async function sendDmFarewellMessage(
  guildMember: GuildMember,
  dmFarewellMessage: string
) {
  try {
    await guildMember.send(dmFarewellMessage);
  } catch (error) {
    cs.error(`Error while sending DM farewell message: ${error}`);
  }
}

/**
 * Sends a farewell embed to the user's DM.
 */
async function sendDmFarewellEmbed(
  guildMember: GuildMember,
  dmFarewellEmbed: EmbedBuilder
) {
  try {
    await guildMember.send({ embeds: [dmFarewellEmbed] });
  } catch (error) {
    cs.error(`Error while sending DM farewell embed: ${error}`);
  }
}

/**
 * Sends a farewell message to the server channel.
 */
async function sendServerFarewellMessage(
  farewellChannel: TextChannel,
  serverFarewellMessage: string
) {
  try {
    await farewellChannel.send(serverFarewellMessage);
  } catch (error) {
    cs.error(`Error while sending server farewell message: ${error}`);
  }
}

/**
 * Sends a farewell embed to the server channel.
 */
async function sendServerFarewellEmbed(
  farewellChannel: TextChannel,
  serverFarewellEmbed: EmbedBuilder
) {
  try {
    await farewellChannel.send({ embeds: [serverFarewellEmbed] });
  } catch (error) {
    cs.error(`Error while sending server farewell embed: ${error}`);
  }
}
