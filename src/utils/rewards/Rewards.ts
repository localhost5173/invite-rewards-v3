import { Guild, PermissionFlagsBits } from "discord.js";
import { cs } from "../console/customConsole";
import { db } from "../db/db";
import { RewardDocument } from "../db/models/rewards";
import { client } from "../..";

export class Rewards {
  static async handleGiveRewards(guildId: string, userId: string) {
    try {
      const rewards = await db.rewards.getRewards(guildId);
      const inviteCount = await db.invites.userInvites.getRealAndBonusInvites(
        guildId,
        userId,
        "alltime"
      );

      if (!rewards) return;

      for (const reward of rewards) {
        // Check if the role reward should be removed
        if (
          reward.claimedBy.includes(userId) &&
          inviteCount < reward.inviteThreshold &&
          reward.removable &&
          reward.rewardType === "role"
        ) {
          await unclaimRoleReward(reward, guildId, userId);
          continue;
        }
        if (reward.claimedBy.includes(userId)) continue;
        if (inviteCount < reward.inviteThreshold) continue;

        // Give the reward
        switch (reward.rewardType) {
          case "role":
            await giveRoleReward(reward, guildId, userId);
            break;
          case "message":
            await giveMessageReward(reward, guildId, userId);
            break;
          case "messageStore":
            await giveMessageStoreReward(reward, guildId, userId);
            break;
        }
      }
    } catch (error) {
      cs.error("Error while handling give rewards: " + error);
    }
  }
}

async function giveRoleReward(
  reward: RewardDocument,
  guildId: string,
  userId: string
) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const guildMember = await guild.members.fetch(userId);
    const bot = guild.members.me;
    const roleId = reward.roleId;

    if (!bot?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      cs.dev(
        "Bot does not have the necessary permissions to manage roles, sending error to server owner"
      );
      return;
    }

    if (!roleId) {
      cs.dev("Role ID not found while giving role reward");
      return;
    }

    const role =
      guildMember.guild.roles.cache.get(roleId) ||
      (await guildMember.guild.roles.fetch(roleId));

    if (!role) {
      cs.dev("Role not found while giving role reward");
      return;
    }

    if (role.managed) {
      cs.dev("Cannot assign a managed role, giving role reward");
      return;
    }

    if (bot.roles.highest.position <= role.position) {
      cs.dev(
        "handleAutoRoles: Bot's highest role must be higher than the role to be managed in order to assign it"
      );
      return;
    }

    if (guildMember.roles.cache.has(roleId)) {
      cs.dev("Member already has the role, giving role reward");
      await db.rewards.setAsClaimed(guildId, reward.rewardName, userId);
      return;
    }

    await guildMember.roles.add(role);
    await db.rewards.setAsClaimed(guildId, reward.rewardName, userId);
  } catch (error) {
    cs.error("Error while giving role reward: " + error);
  }
}

async function giveMessageReward(
  reward: RewardDocument,
  guildId: string,
  userId: string
) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const guildMember = await guild.members.fetch(userId);

    let message = reward.message;

    if (!message) {
      cs.dev("Message not found while giving message reward");
      return;
    }

    // Check if the bot has permission to send DMs
    if (!guildMember) {
      cs.dev("Guild member not found");
      return;
    }

    message = replaceMessagePlaceholders(guild, reward.inviteThreshold, message);

    // Attempt to send the DM
    try {
      await guildMember.send(message);
      await db.rewards.setAsClaimed(guildId, reward.rewardName, userId);
      cs.dev(`Message reward sent to user ${userId}`);
    } catch (dmError) {
      cs.error(`Failed to send DM to user ${userId}: ${dmError}`);
    }
  } catch (error) {
    cs.error("Error while giving message reward: " + error);
  }
}

async function giveMessageStoreReward(
  reward: RewardDocument,
  guildId: string,
  userId: string
) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const guildMember = await guild.members.fetch(userId);

    // Check if the bot has permission to send DMs
    if (!guildMember) {
      cs.dev("Guild member not found");
      return;
    }

    // Extract the first message from the store
    let message = await db.rewards.shiftFirstMessageFromStore(
      guildId,
      reward.rewardName
    );

    if (!message) {
      cs.dev("Message not found while giving message store reward");
      return;
    }

    message = replaceMessagePlaceholders(guild, reward.inviteThreshold, message);

    // Attempt to send the DM
    try {
      await guildMember.send(message);
      await db.rewards.setAsClaimed(guildId, reward.rewardName, userId);
      cs.dev(`Message store reward sent to user ${userId}`);
    } catch (dmError) {
      cs.error(`Failed to send DM to user ${userId}: ${dmError}`);
    }
  } catch (error) {
    cs.error("Error while giving message store reward: " + error);
  }
}

async function unclaimRoleReward(
  reward: RewardDocument,
  guildId: string,
  userId: string
) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const guildMember = await guild.members.fetch(userId);
    const bot = guild.members.me;
    const roleId = reward.roleId;

    if (!bot?.permissions.has(PermissionFlagsBits.ManageRoles)) {
      cs.dev(
        "Bot does not have the necessary permissions to manage roles, sending error to server owner"
      );
      return;
    }

    if (!roleId) {
      cs.dev("Role ID not found while unclaiming role reward");
      return;
    }

    const role =
      guildMember.guild.roles.cache.get(roleId) ||
      (await guildMember.guild.roles.fetch(roleId));

    if (!role) {
      cs.dev("Role not found while unclaiming role reward");
      return;
    }

    if (role.managed) {
      cs.dev("Cannot assign a managed role, unclaiming role reward");
      return;
    }

    if (bot.roles.highest.position <= role.position) {
      cs.dev(
        "handleAutoRoles: Bot's highest role must be higher than the role to be managed in order to assign it"
      );
      return;
    }

    if (!guildMember.roles.cache.has(roleId)) {
      cs.dev("Member does not have the role, unclaiming role reward");
      return;
    }

    await guildMember.roles.remove(role);
    await db.rewards.unclaimReward(guildId, reward.rewardName, userId);

    cs.dev(`Role reward unclaimed from user ${userId}`);
  } catch (error) {
    cs.error("Error while unclaiming role reward: " + error);
  }
}

function replaceMessagePlaceholders(
    guild: Guild,
    inviteThreshold: number,
    message: string,
) {
    return message
        .replace(/{server-name}/g, guild.name)
        .replace(/{threshold}/g, inviteThreshold.toString());
}