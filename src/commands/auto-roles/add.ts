import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { addAutoRole, getAutoRoles } from "../../firebase/autoRoles.js";
import { errorEmbed, successEmbed } from "../../utils/embeds/autoRoles.js";
import { devMode } from "../../index.js";

export default async function (interaction : ChatInputCommandInteraction) {
  if (!interaction.guild) return;
  const role = interaction.options.getRole("role");

  await interaction.deferReply({ ephemeral: true });

  if (!role || role.managed) {
    return interaction.followUp({
      embeds: [errorEmbed("Invalid role")],
      ephemeral: true,
    });
  }


  try {
    const roleId = role.id;
    const guildId = interaction.guild.id;

    // Fetch the role to be managed
    const roleToManage = interaction.guild.roles.cache.get(roleId); // Replace `roleId` with the actual role ID variable

    if (!roleToManage) {
      return interaction.followUp({
        embeds: [errorEmbed("The specified role does not exist in this guild")],
        ephemeral: true,
      });
    }

    // Check if the bot's highest role is higher in the hierarchy than the role to be managed
    if (
      !interaction.guild.members.me ||
      interaction.guild.members.me.roles.highest.position <=
      roleToManage.position
    ) {
      return interaction.followUp({
        embeds: [
          errorEmbed(
            "My highest role must be higher than the role to be managed in order to assign it. Move the Invite Rewards role above the role you want to assign. For assistance, visit the support server via \`/help\`."
          ),
        ],
        ephemeral: true,
      });
    }

    // Add the role to the database
    const autoRoles = await getAutoRoles(guildId);

    if (autoRoles.length >= 6) {
      return interaction.followUp({
        embeds: [
          errorEmbed("You can only have a maximum of 6 auto-assign roles"),
        ],
      });
    }

    await addAutoRole(guildId, roleId);

    interaction.followUp({
      embeds: [successEmbed(`Auto role <@&${role.id}> has been added`)],
    });
  } catch (error) {
    console.error(error);
    return interaction.followUp({
      embeds: [errorEmbed("An error occurred while creating the auto role")],
      ephemeral: true,
    });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
};
