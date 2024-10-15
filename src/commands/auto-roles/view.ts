import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { getAutoRoles } from "../../firebase/autoRoles.js";
import { errorEmbed } from "../../utils/embeds/autoRoles.js";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { devMode } from "../../index.js";

export default async function (interaction : ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const guildId = interaction.guild.id;

    // Fetch the roles from the database
    const roles = await getAutoRoles(guildId);

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle("Auto Roles for " + interaction.guild.name)
      .setColor("#00FF00")
      .setTimestamp();

    if (roles.length === 0) {
      embed.setDescription("There are no auto-assign roles for this server.");
    } else {
      const fields = roles
        .map((roleId: string) => {
          const role = interaction.guild?.roles.cache.get(roleId);
          return role
            ? { name: "Role", value: `<@&${role.id}>`, inline: true }
            : null;
        })
        .filter((field: any) => field !== null);

      embed.addFields(fields);
    }

    interaction.followUp({
      embeds: [embed],
    });
  } catch (error) {
    console.error(error);
    return interaction.followUp({
      embeds: [
        errorEmbed("An error occurred while fetching the auto-assign roles."),
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
