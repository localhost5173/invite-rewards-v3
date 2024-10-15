import { GuildMember } from "discord.js";
import { addInvitesOnJoin } from "../../utils/invites/addInvitesOnJoin.js";
import { isVerificationChannelSet } from "../../firebase/channels.js";
import { isVerificationOn } from "../../firebase/verification.js";
import handleAutoRoles from "../../utils/autoRoles/handleAutoRoles.js";

/**
 * Handles the event when a member joins a guild.
 * @param guildMember - The GuildMember that joined.
 */
export default async function (guildMember: GuildMember) {
  // Check if verification is enabled
  if (!await isVerificationChannelSet(guildMember.guild.id) && !await isVerificationOn(guildMember.guild.id)) {
    addInvitesOnJoin(guildMember);
  }

  // Assign auto roles
  await handleAutoRoles(guildMember);
}