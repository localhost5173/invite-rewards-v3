import { User } from "discord.js";
import {
  getGuildRewards,
  hasBeenUsedBy,
  removeLinkFromBank,
  updateUsedBy,
} from "../../firebase/rewards.js";
import { getTotalInvitesForUser } from "../../firebase/invites.js";
import { client } from "../../index.js";
import { sendMessageToInfoChannel } from "../../firebase/channels.js";

interface Reward {
  type: "role" | "link" | "link-bank" | "custom";
  role?: string;
  link?: string;
  bank?: string[];
  customReward?: string;
  removable?: boolean;
}

interface Rewards {
  [inviteCount: string]: Reward;
}

// Use the defined types for rewards
export default async function handleRewards(
  guildId: string,
  user: User,
  previousInvites: number
) {
  // Fetch the guild object and rewards document
  if (user.bot) return;
  const guild = client.guilds.cache.get(guildId);
  const rewardsDoc = await getGuildRewards(guildId);

  if (!guild || !rewardsDoc) {
    return;
  }

  const rewards: Rewards = rewardsDoc || {}; // Ensure rewards is of type Rewards
  const currentTotalInvites = await getTotalInvitesForUser(guildId, user.id);

  // Iterate over the rewards and check if the user qualifies for any new rewards
  for (const [inviteCount, reward] of Object.entries(rewards)) {
    const inviteThreshold = parseInt(inviteCount, 10);

    // Ensure reward is of type Reward
    if (
      previousInvites < inviteThreshold &&
      currentTotalInvites >= inviteThreshold
    ) {
      if (reward) {
        // Add the role to the user if the reward is a role
        if (reward.type === "role" && reward.role) {
          const role = guild.roles.cache.get(reward.role);
          if (role && !role.managed) {
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (member) {
              await member.roles.add(role).catch(console.error);
            }
          }

          if (role && role.managed) {
            await sendMessageToInfoChannel(
              guildId,
              `The role <@&${role.id}> is managed (a bot role) and cannot be added to <@&${user.id}>, please remove this reward.`
            );
          }
        }
        // Send the reward link to the user if the reward is a link
        else if (reward.type === "link" && reward.link) {
          await user
            .send(
              `You have achieved ${inviteThreshold} invites in ${guild.name}. Here is your reward for doing so: ${reward.link}`
            )
            .catch(console.error);
        }
        // Handle link bank rewards
        else if (reward.type === "link-bank" && reward.bank) {
          // Check if the user has already accessed the bank
          if (!(await hasBeenUsedBy(guildId, inviteThreshold, user.id))) {
            await updateUsedBy(guildId, inviteThreshold, user.id);
            const link = reward.bank[0];

            if (link) {
              await user
                .send(
                  `You have achieved ${inviteThreshold} invites in ${guild.name}. Here is your reward for doing so: ${link}`
                )
                .catch(console.error);
              await removeLinkFromBank(
                guildId,
                inviteThreshold,
                reward.bank[0]
              );
            } else {
              // Link bank is empty
              await user.send(
                `You have achieved ${inviteThreshold} invites in ${guild.name}. Sadly, there are no more rewards left. Please contact the server staff for ${guild.name} for more information.`
              );
            }

            // Warn the staff when the bank is about to run out
            if (reward.bank.length <= 10) {
              // Subtract 1 to account for the link that was just sent, make sure it doesnt go below 0
              const remainingLinks =
                reward.bank.length - 1 >= 0 ? reward.bank.length - 1 : 0;
              await sendMessageToInfoChannel(
                guildId,
                `The link bank for ${inviteThreshold} invites only has ${remainingLinks} left! Please add more links.`
              );
            }
          }
          // Handle custom rewards
        } else if (reward.type === "custom" && reward.customReward) {
          await user
            .send(
              `You have achieved ${inviteThreshold} invites in ${guild.name}. Here is your custom reward: ${reward.customReward}`
            )
            .catch(console.error);
        }
      }
    }

    // Remove the reward if the user no longer qualifies and the reward is removable
    if (
      previousInvites >= inviteThreshold &&
      currentTotalInvites < inviteThreshold
    ) {
      if (reward.removable) {
        if (reward.type === "role" && reward.role) {
          const role = guild.roles.cache.get(reward.role);
          if (role) {
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (member) {
              await member.roles.remove(role).catch(console.error);
            }
          }
        }
      }
    }
  }
}
