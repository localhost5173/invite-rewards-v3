import { EmbedBuilder } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };;

// Helper function to create an embed for the rewards
export function viewRewardsEmbed(rewards: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🎁 Server Invite Rewards 🎁")
    .setColor(0x00ff00) // Green color to indicate rewards
    .setDescription("Here are the invite rewards for this server:")
    .setThumbnail(botconfig.logo) // Replace with your thumbnail URL
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  // Iterate over the rewards map to build the embed fields
  Object.entries(rewards).forEach(([inviteCount, reward]: [string, any]) => {
    let rewardType;
    if (reward.type === "role") {
      rewardType = `Role: <@&${reward.role}>`; // Role mention
    } else if (reward.type === "link") {
      rewardType = `Link: [${reward.link}](${reward.link})`; // Link with clickable text
    } else if (reward.type === "link-bank") {
      rewardType = `Link Bank: ${reward.bank.length} links`; // Link bank
    } else if (reward.type === "custom") {
      rewardType = `Custom Reward: ${reward.customReward}`; // Custom reward
    } else {
      rewardType = "Unknown Reward";
    }

    embed.addFields({
      name: `${inviteCount} Invites`,
      value: rewardType,
      inline: false,
    });
  });

  return embed;
}

export function createRewardEmbed(reward: {
  type: "role" | "link" | "link-bank" | "custom";
  role?: string;
  customReward?: string;
  link?: string;
  removable: boolean;
  bank?: string[];
  count: number;
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🎁 New Invite Reward 🎁")
    .setColor(0x00ff00) // Green color to indicate rewards
    .setDescription(
      `A new reward has been set for **${reward.count} invites**!`
    )
    .setThumbnail(botconfig.logo) // Replace with your thumbnail URL
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  // Add reward details to the embed
  switch (reward.type) {
    case "role":
      embed.addFields({ name: "Reward Type", value: "Role", inline: true });
      embed.addFields({
        name: "Role",
        value: `<@&${reward.role}>`,
        inline: true,
      });
      break;
    case "link":
      embed.addFields({ name: "Reward Type", value: "Link", inline: true });
      embed.addFields({
        name: "Link",
        value: `[Click Here](${reward.link})`,
        inline: true,
      });
      break;
    case "link-bank":
      embed.addFields({
        name: "Reward Type",
        value: "Link Bank",
        inline: true,
      });
      embed.addFields({
        name: "Links Available",
        value: `${reward.bank?.length}`,
        inline: true,
      });
      break;
    case "custom":
      embed.addFields({ name: "Reward Type", value: "Custom", inline: true });
      embed.addFields({
        name: "Custom Reward",
        value: reward.customReward || "N/A",
        inline: true,
      });
      break;
    default:
      embed.addFields({ name: "Reward Type", value: "Unknown", inline: true });
  }

  // Add removable status
  embed.addFields({
    name: "Removable",
    value: reward.removable ? "Yes" : "No",
    inline: true,
  });

  return embed;
}

export function removeRewardEmbed(count: number): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🗑️ Reward Removed 🗑️")
    .setColor(0xff0000) // Red color to indicate removal
    .setDescription(
      `The reward for **${count} invites** has been successfully removed.`
    )
    .setThumbnail(botconfig.logo) // Replace with your thumbnail URL
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for successful operation
export function fillBankSuccessEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("✅ Success ✅")
        .setColor(0x00ff00) // Green color to indicate success
        .setDescription(message)
        .setFooter({ text: "Invite Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}

// Function to create an embed for errors
export function fillBankErrorEmbed(errorMessage: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("❌ Error ❌")
        .setColor(0xff0000) // Red color to indicate error
        .setDescription(errorMessage)
        .setFooter({ text: "Invite Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}