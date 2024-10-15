import { GuildMember, Interaction } from "discord.js";
import { addInvitesOnJoin } from "../invites/addInvitesOnJoin.js";

export async function giveRole(interaction: Interaction, roleId: string) {
  const member = interaction.guild?.members.cache.get(
    interaction.user.id
  ) as GuildMember;

  if (!member) return; // Ensure the member exists

  if (!roleId) return; // Check if the role ID exists
  const role = interaction.guild?.roles.cache.get(roleId);
  if (!role) return; // Check if the role exists
  // Add the role to the user
  await member.roles.add(role);
  await addInvitesOnJoin(member); // Add invites to the inviter
}