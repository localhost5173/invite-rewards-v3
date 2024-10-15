import { EmbedBuilder } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };;

// Function to create an embed for the leaderboard
export async function viewLeaderboardEmbed(
  client: any,
  leaderboard: any[],
  leaderboardType: string
) {
  // Format the leaderboard data into readable entries
  const formattedLeaderboard = await Promise.all(
    leaderboard.map(async (entry: any, index: any) => {
      const user = await client.users.fetch(entry.userId);
      return `**${index + 1}. ${user.tag}** - ${entry.invites} invites`;
    })
  );

  let name = "";

  switch (leaderboardType) {
    case "allTime":
      name = "All Time";
      break;
    case "monthly":
      name = "Monthly";
      break;
    case "weekly":
      name = "Weekly";
      break;
    case "daily":
      name = "Daily";
      break;
    default:
      name = "Unknown";
  }

  // Create the embed with the formatted leaderboard
  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${name} Leaderboard 🏆`)
    .setDescription("Here are the top inviters in this server:")
    .setColor(0x7289da) // Discord Blurple
    .addFields({
      name: "Top Inviters",
      value: formattedLeaderboard.join("\n") || "No data available",
      inline: false,
    })
    .setThumbnail(botconfig.logo) // Replace with your thumbnail URL
    .setFooter({
      text: "Invite Leaderboard",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function viewBlacklistEmbed(blacklist: {
  user: string[];
  role: string[];
}): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🚫 Leaderboard Blacklist 🚫")
    .setColor(0xff0000) // Red color to indicate a blacklist
    .setDescription(
      "Here are the users and roles currently blacklisted from the leaderboard:"
    )
    .setThumbnail(botconfig.logo) // Replace with your thumbnail URL
    .setFooter({
      text: "Blacklist Information",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  // Add users to the embed
  if (blacklist.user.length > 0) {
    const userMentions = blacklist.user
      .map((userId: string) => `<@${userId}>`)
      .join("\n");
    embed.addFields({
      name: "👤 Blacklisted Users",
      value: userMentions,
      inline: true,
    });
  } else {
    embed.addFields({
      name: "👤 Blacklisted Users",
      value: "None",
      inline: true,
    });
  }

  // Add roles to the embed
  if (blacklist.role.length > 0) {
    const roleMentions = blacklist.role
      .map((roleId: string) => `<@&${roleId}>`)
      .join("\n");
    embed.addFields({
      name: "🔧 Blacklisted Roles",
      value: roleMentions,
      inline: true,
    });
  } else {
    embed.addFields({
      name: "🔧 Blacklisted Roles",
      value: "None",
      inline: true,
    });
  }

  return embed;
}

// Function to create an embed for successful operation
export function removeFromBlacklistSuccessEmbed(message: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("✅ Success ✅")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(message)
    .setFooter({
      text: "Blacklist Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function removeFromBlacklistErrorEmbed(
  errorMessage: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({
      text: "Blacklist Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for successful operation
export function blacklistSuccessEmbed(message: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("✅ Success ✅")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(message)
    .setFooter({
      text: "Blacklist Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function blacklistErrorEmbed(errorMessage: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({
      text: "Blacklist Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}
