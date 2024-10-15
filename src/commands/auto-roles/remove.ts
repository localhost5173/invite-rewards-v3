import type {
  CommandOptions,
} from "commandkit";
import { ChatInputCommandInteraction } from "discord.js";
import { removeAutoRole } from "../../firebase/autoRoles.ts";
import { errorEmbed, successEmbed } from "../../utils/embeds/autoRoles.ts";
import { devMode } from "../../index.ts";

export default async function (interaction : ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const role = interaction.options.getRole("role");

  await interaction.deferReply({ ephemeral: true });

  if (!role) {
    return interaction.reply({
      content: "Invalid role",
      ephemeral: true,
    });
  }

  try {
    const roleId = role.id;
    const guildId = interaction.guild.id;

    // Add the role to the database
    await removeAutoRole(guildId, roleId);

    interaction.followUp({
      embeds: [
        successEmbed(
          `Auto role <@&${role.id}> has been removed from auto-assign`
        ),
      ],
    });
  } catch (error) {
    console.error(error);
    return interaction.followUp({
      embeds: [
        errorEmbed(
          "An error occurred while remove the auto role from auto-assign"
        ),
      ],
      ephemeral: true,
    });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};
