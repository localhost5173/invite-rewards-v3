import { ChatInputCommandInteraction } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

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

    // Check if the role is an auto role
    const autoroles = await db.autoRoles.getRoles(interaction.guildId!);
    if (!autoroles.includes(role.id)) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "autoRoles.remove.notAutoRoleError",
            { role: `<@&${role.id}>` }
          ),
        ],
        ephemeral: true,
      });
    }

    // Remove the role from auto-assign
    await db.autoRoles.removeRole(interaction.guildId!, role.id);

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          interaction.guildId!,
          "autoRoles.remove.success",
          { role: `<@&${role.id}>` }
        ),
      ],
    });
    db.usage.incrementUses(interaction.guildId!, UsageCommands.AutoRoleRemove);
  } catch (error: unknown) {
    cs.error("Error while removing auto-role: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
