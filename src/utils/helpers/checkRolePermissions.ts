import {
  APIInteractionGuildMember,
  ButtonInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  Role,
} from "discord.js";
import { cs } from "../console/customConsole.js";
import { Embeds } from "../embeds/embeds.js";

export default async function (
  interaction: ButtonInteraction,
  roleId: string | null,
  member: GuildMember | APIInteractionGuildMember | null
): Promise<{ passed: boolean; role: Role | null; embed: EmbedBuilder }> {
  const guildId = interaction.guild!.id;

  if (!roleId) {
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.verificationDisabled"
      ),
    };
  }

  if (member && "cache" in member.roles && member.roles.cache.has(roleId)) {
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.alreadyVerified"
      ),
    };
  }

  const bot = interaction.guild!.members.me;
  if (!bot) {
    cs.dev("Bot not found in guild while handling auto roles");
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(guildId, "general.botNotFound"),
    };
  }

  // Check if the bot has the necessary permissions
  if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
    cs.dev(
      "Bot does not have the necessary permissions to manage roles, verification simple"
    );
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.missingPermissions"
      ),
    };
  }

  const role = interaction.guild!.roles.cache.get(roleId);

  // Check if the role exists
  if (!role) {
    cs.dev("verificationSimple: Role not found");
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.roleNotFound"
      ),
    };
  }

  // Check if the role is managed by an integration
  if (role.managed) {
    cs.dev("verificationSimple: Cannot assign a managed role");
    return {
      passed: false,
      role: null,
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.managedRole"
      ),
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
      embed: await Embeds.createEmbed(
        guildId,
        "verification.event.all.hierarchyError"
      ),
    };
  }

  return { passed: true, role, embed: new EmbedBuilder() };
}
