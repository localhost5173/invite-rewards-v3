import {
  APIInteractionGuildMember,
  ButtonInteraction,
  GuildMember,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import { cs } from "../console/customConsole";

export default async function (
  interaction: ButtonInteraction,
  roleId: string | null,
  member: GuildMember | APIInteractionGuildMember | null
): Promise<{ passed: boolean; role: Role | null; message: string }> {
  if (!roleId) {
    return {
      passed: false,
      role: null,
      message: "Verification is disabled in this server.",
    };
  }

  if (member && "cache" in member.roles && member.roles.cache.has(roleId)) {
    return { passed: false, role: null, message: "You are already verified" };
  }

  const bot = interaction.guild!.members.me;
  if (!bot) {
    cs.dev("Bot not found in guild while handling auto roles");
    return { passed: false, role: null, message: "Bot not found in guild" };
  }

  // Check if the bot has the necessary permissions
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
    cs.dev(
      "Bot does not have the necessary permissions to manage roles, verification simple"
    );
    return {
      passed: false,
      role: null,
      message: "Bot does not have the necessary permissions to manage roles",
    };
  }

  const role = interaction.guild!.roles.cache.get(roleId);

  // Check if the role exists
  if (!role) {
    cs.dev("verificationSimple: Role not found");
    return { passed: false, role: null, message: "Role not found" };
  }

  // Check if the role is managed by an integration
  if (role.managed) {
    cs.dev("verificationSimple: Cannot assign a managed role");
    return {
      passed: false,
      role: null,
      message: "Cannot assign a managed role",
    };
  }

  // Check if the bot's highest role is higher than the role to be assigned
  if (bot.roles.highest.position <= role.position) {
    cs.dev(
      "verificationSimple: Bot's highest role must be higher than the role to be managed in order to assign it"
    );
    return {
      passed: false,
      role: null,
      message:
        "Bot's highest role must be higher than the role to be managed in order to assign it",
    };
  }

  return { passed: true, role, message: "" };
}
