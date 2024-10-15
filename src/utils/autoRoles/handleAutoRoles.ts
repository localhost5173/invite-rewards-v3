import { GuildMember, PermissionFlagsBits } from "discord.js";
import { getAutoRoles } from "../../firebase/autoRoles.js";
import { client } from "../../index.js";
import { sendMessageToInfoChannel } from "../../firebase/channels.js";

export default async function handleAutoRoles(guildMember: GuildMember) {
  try {
    const autoRoles = await getAutoRoles(guildMember.guild.id);
    if (autoRoles.length === 0) return;

    // Fetch the bot's member object in the guild
    const botMember =
      guildMember.guild.members.cache.get(client.user?.id!) ||
      (await guildMember.guild.members.fetch(client.user?.id!));

    // Check if the bot has the MANAGE_ROLES permission
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      console.error("Bot does not have permission to manage roles.");
      await sendMessageToInfoChannel(
        guildMember.guild.id,
        "Bot does not have permission to manage roles. Please fix this for the auto-roles feature to work."
      );
      return;
    }

    // Add the auto-roles to the member
    for (const roleId of autoRoles) {
      const role =
        guildMember.guild.roles.cache.get(roleId) ||
        (await guildMember.guild.roles.fetch(roleId));
      if (!role) {
        console.warn(
          `Role with ID ${roleId} not found in guild ${guildMember.guild.id}`
        );
        continue;
      }

      // Check if the bot's highest role is above the role to be assigned
      if (botMember.roles.highest.position <= role.position) {
        console.error(
          `Bot's highest role is not high enough to manage the role with ID ${roleId}.`
        );
        await sendMessageToInfoChannel(
          guildMember.guild.id,
          `Bot's highest role is not high enough to manage the role with ID ${roleId}. Please adjust the role hierarchy. For assistance, visit the support server via \`help\`.`
        );
        continue;
      }

      await guildMember.roles.add(role);
    }
  } catch (error : any) {
    switch (error.code) {
      case 10011:
        console.error("Auto Role not found.");
        break;
      default:
        console.error("Error while auto-adding role: ", error);
    }
  }
}
