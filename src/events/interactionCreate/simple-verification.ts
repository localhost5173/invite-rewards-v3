import { Interaction, GuildMember } from "discord.js";
import { getVerificationRole } from "../../firebase/verification.js";
import { addInvitesOnJoin } from "../../utils/invites/addInvitesOnJoin.js";
import { giveRole } from "../../utils/verification/giveRole.js";
import { errorEmbed } from "../../utils/embeds/verification.js";

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return; // Check if the interaction is a button interaction
  if (interaction.customId !== "simple-verification") return; // Check if the button's custom ID is "verify"
  if (!interaction.guildId) return; // Check if the interaction is in a guild

  try {
    const roleId = await getVerificationRole(interaction.guildId); // Get the verification role ID
    if (!roleId) return; // Check if the role ID exists

    // Check if the user already has the role
    const member = interaction.member;
    if (member && "cache" in member.roles && member.roles.cache.has(roleId)) {
      return interaction.reply({
        content: "You are already verified.",
        ephemeral: true,
      });
    }

    await interaction.deferUpdate(); // Defer the interaction to prevent it from timing out
    await giveRole(interaction, roleId);
    await interaction.followUp({
      content: "You have been verified!",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error adding role simple-verification:", error);
    const embed = errorEmbed();
    interaction.followUp({
      embeds: [embed],
      ephemeral: true,
    });
  }
}
