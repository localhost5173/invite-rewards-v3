import { EmbedBuilder, User } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };;

export function addFakeInvitesEmbed(
  targetUser: User,
  amount: number,
  totalInvites: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🎉 Fake Invites Added 🎉")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(
      `Successfully added **${amount} fake invites** to **${targetUser.username}**.`
    )
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      { name: "Total Invites", value: `${totalInvites}`, inline: true },
      { name: "User", value: `<@${targetUser.id}>`, inline: true }
    )
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function removeFakeInvitesEmbed(
  targetUser: User,
  amount: number,
  totalInvites: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🗑️ Fake Invites Removed 🗑️")
    .setColor(0xff0000) // Red color to indicate removal
    .setDescription(
      `Successfully removed **${amount} fake invites** from **${targetUser.username}**.`
    )
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields(
      { name: "Total Invites", value: `${totalInvites}`, inline: true },
      { name: "User", value: `<@${targetUser.id}>`, inline: true }
    )
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo, // Replace with your footer icon URL
    })
    .setTimestamp();

  return embed;
}

// Function to create an embed for breakdown of real and fake invites
export function inviteBreakdownEmbed(
  targetUser: any,
  realInvites: number,
  fakeInvites: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📊 Invite Breakdown 📊")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(targetUser ? `User <@${targetUser.id}> has:` : "You have:")
    .addFields(
      { name: "Real Invites", value: `${realInvites}`, inline: true },
      { name: "Fake Invites", value: `${fakeInvites}`, inline: true }
    )
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for total invites
export function totalInvitesEmbed(
  targetUser: any,
  inviteCount: number
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📈 Total Invites 📈")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(
      targetUser
        ? `User <@${targetUser.id}> has invited ${inviteCount} members to this server.`
        : `You have invited ${inviteCount} members to this server.`
    )
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function invitesErrorEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription("An error occurred while fetching your invite count.")
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when the inviter is found
export function inviterEmbed(targetUser: any, inviter: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("👥 Inviter Found 👥")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(
      `User <@!${targetUser.id}> was invited by <@!${inviter.id}>.`
    )
    .setThumbnail(inviter.displayAvatarURL({ dynamic: true }))
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when no inviter is found
export function noInviterEmbed(targetUser: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❓ No Inviter Found ❓")
    .setColor(0xffa500) // Orange color to indicate no inviter found
    .setDescription(`No inviter found for user <@!${targetUser.id}>.`)
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function inviterErrorEmbed(errorMessage: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when invited users are found
export function invitedListEmbed(
  targetUser: any,
  invitedUsersMentions: string[]
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📋 Invited Users List 📋")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(
      `Users invited by <@${targetUser.id}>:\n${invitedUsersMentions.join(
        "\n"
      )}`
    )
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when no invited users are found
export function noInvitesInvitedListEmbed(targetUser: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❓ No Invited Users Found ❓")
    .setColor(0xffa500) // Orange color to indicate no invited users found
    .setDescription(`No users were invited by <@${targetUser.id}>.`)
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function invitedListErrorEmbed(errorMessage: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when no joins are recorded
export function whoUsedNoJoinsEmbed(inviteCode: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❓ No Joins Recorded ❓")
    .setColor(0xffa500) // Orange color to indicate no joins found
    .setDescription(
      `No joins were recorded with the invite link \`${inviteCode}\`.`
    )
    .setFooter({
      text: "Invite Management",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for when joins are recorded
export function whoUsedJoinsEmbed(
  inviteCode: string,
  inviteeMentionList: string[]
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📋 Joins Recorded 📋")
    .setColor(0x00ff00) // Green color to indicate success
    .setDescription(
      `The following users joined using the invite link \`${inviteCode}\`:\n${inviteeMentionList.join(
        "\n"
      )}`
    )
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

// Function to create an embed for errors
export function whoUsedErrorEmbed(errorMessage: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({
      text: "Invite Rewards",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}
