import { GuildMember, Interaction, Role } from "discord.js";

export default async function (interaction: Interaction) {
  if (!interaction.guild) return;
  if (!interaction.channel) return;

  // Handle button interactions
  if (interaction.isButton() && interaction.customId.startsWith("role-")) {
    const roleId = interaction.customId.split("-")[1];
    const member = interaction.member as GuildMember;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!member || !role) return;

    // Check if the user already has the role
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role);
      await interaction.reply({
        content: `The role <@&${role.id}> has been removed.`,
        ephemeral: true,
      });
      return;
    }

    // Assign the role
    try {
      await member.roles.add(role);
      await interaction.reply({
        content: `The role <@&${role.id}> has been assigned.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Failed to assign role: ", error);
      await interaction.reply({
        content:
          "Failed to assign role. Please contact the server administrator.",
        ephemeral: true,
      });
    }
  }

  // Handle select menu interactions
  // if (
  //   interaction.isStringSelectMenu() &&
  //   interaction.customId === "reaction-role-dropdown"
  // ) {

  //   const member = interaction.member as GuildMember;
  //   if (!member) return;

  //   const selectedRoleIds = interaction.values;

  //   // Get current roles
  //   const currentRoles = member.roles.cache.map((role) => role.id);

  //   // Roles to add
  //   const rolesToAdd = selectedRoleIds
  //     .filter((roleId) => !currentRoles.includes(roleId))
  //     .map((roleId) => interaction.guild?.roles.cache.get(roleId))
  //     .filter((role): role is Role => role !== null);

  //   // Roles to remove
  //   const rolesToRemove = currentRoles
  //     .filter((roleId) => !selectedRoleIds.includes(roleId))
  //     .map((roleId) => interaction.guild?.roles.cache.get(roleId))
  //     .filter((role): role is Role => role !== null);

  //   // Update roles
  //   try {
  //     if (rolesToAdd.length > 0) {
  //       await member.roles.add(rolesToAdd);
  //     }

  //     if (rolesToRemove.length > 0) {
  //       await member.roles.remove(rolesToRemove);
  //     }

  //     await interaction.reply({
  //       content: `Roles updated: Added ${
  //         rolesToAdd.map((role) => `<@&${role.id}>`).join(", ") || "none"
  //       }, Removed ${
  //         rolesToRemove.map((role) => `<@&${role.id}>`).join(", ") || "none"
  //       }.`,
  //       ephemeral: true,
  //     });
  //   } catch (error) {
  //     console.error("Failed to update roles: ", error);
  //     await interaction.reply({
  //       content:
  //         "Failed to update roles. Please contact the server administrator.",
  //       ephemeral: true,
  //     });
  //   }
  // }
}
