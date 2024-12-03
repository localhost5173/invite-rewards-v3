import { ChatInputCommandInteraction } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const role = interaction.options.getRole("role");

    await interaction.deferReply({ ephemeral: true });

    // Check if the role exists
    if (!role) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.roleNotFoundError"
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the role is managed
    if (role.managed) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.managedRoleAssignError",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the bot has the necessary permissions
    if (
      !interaction.guild!.members.me ||
      interaction.guild!.members.me.roles.highest.position <= role.position
    ) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "roles.hierarchyRoleAssignError",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    // Check if the role is already auto-assigned
    const autoroles = await db.autoRoles.getRoles(interaction.guildId!);
    if (autoroles.includes(role.id)) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "autoRoles.add.alreadyAutoRoleWarning",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    // Check for max auto-assign roles
    if (autoroles.length >= 3) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "autoRoles.add.maxAutoRolesError",
          ),
        ],
        ephemeral: true,
      });
    }

    // Add the role to auto-assign
    await db.autoRoles.addRole(interaction.guildId!, role.id);
    return await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          interaction.guildId!,
          "autoRoles.add.success",
          {
            role: `<@&${role.id}>`,
          }
        ),
      ],
    });
  } catch (error: unknown) {
    cs.error(error as string);
    
    await Helpers.trySendCommandError(interaction);
  }
}
