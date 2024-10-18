import { GuildMember, PermissionFlagsBits } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function handleAutoRoles(guildMember: GuildMember) {
  try {
    const autoRoles = await db.autoRoles.getRoles(guildMember.guild.id);

    if (autoRoles.length === 0) return;

    const bot = guildMember.guild.members.me;
    if (!bot) return cs.dev("Bot not found in guild while handling auto roles");

    // Check if the bot has the necessary permissions
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles))
      return cs.dev(
        "Bot does not have the necessary permissions to manage roles"
      );

    for (const roleId of autoRoles) {
      // Get the role
      const guildRole =
        guildMember.guild.roles.cache.get(roleId) ||
        (await guildMember.guild.roles.fetch(roleId));
      if (!guildRole) {
        cs.dev("handleAutoRoles: Role not found");
        continue;
      }

      // Check if the member already has the role
      if (guildMember.roles.cache.has(roleId)) {
        cs.dev("handleAutoRoles: Member already has the role");
        continue;
      }

      // Check if the role is managed by an integration
      if (guildRole.managed) {
        cs.dev("handleAutoRoles: Cannot assign a managed role");
        continue;
      }

      // Check if the bot's highest role is higher than the role to be assigned
      if (bot.roles.highest.position <= guildRole.position) {
        cs.dev(
          "handleAutoRoles: Bot's highest role must be higher than the role to be managed in order to assign it"
        );
        continue;
      }

      await guildMember.roles.add(guildRole);
    }
  } catch (error: unknown) {
    cs.error(error as string);
  }
}
