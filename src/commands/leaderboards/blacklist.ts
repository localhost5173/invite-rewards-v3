import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { addToBlacklist } from "../../firebase/leaderboards.ts";
import updateBlacklistLeaderboards from "../../utils/leaderboards/updateBlacklistLeaderboards.ts";
import { blacklistErrorEmbed, blacklistSuccessEmbed } from "../../utils/embeds/leaderboards.ts";
import { devMode } from "../../index.ts";

export const data: CommandData = {
  name: "blacklist",
  description: "Blacklist a user or role from all leaderboards.",
  options: [
    {
      name: "type",
      description: "The type of entity to blacklist (user or role)",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "user", value: "user" },
        { name: "role", value: "role" },
      ],
    },
    {
      name: "user",
      description: "The user to blacklist",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "role",
      description: "The role to blacklist",
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const guildId = interaction.guild?.id;
  const type = interaction.options.getString("type");
  const user = interaction.options.getUser("user");
  const role = interaction.options.getRole("role");

  await interaction.deferReply({ ephemeral: true });

  if (type === "user" && !user) {
    const embed = blacklistErrorEmbed("Please provide a valid user to blacklist.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (type === "role" && !role) {
    const embed = blacklistErrorEmbed("Please provide a valid role to blacklist.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!guildId) {
    const embed = blacklistErrorEmbed("This command can only be used in a guild.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (type === "user" && (!user || !user.id)) {
    const embed = blacklistErrorEmbed("User not found.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (type === "role" && (!role || !role.id)) {
    const embed = blacklistErrorEmbed("Role not found.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!type) {
    const embed = blacklistErrorEmbed("Please provide a valid type to blacklist (user or role).");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!["user", "role"].includes(type)) {
    const embed = blacklistErrorEmbed("Please provide a valid type to blacklist (user or role).");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  try {
    await addToBlacklist(guildId, user?.id! || role?.id!, type as any);
    await updateBlacklistLeaderboards(guildId);
    const embed = blacklistSuccessEmbed(`Role ${role?.name || user?.displayName} has been blacklisted from the leaderboard.`);
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error(`Failed to blacklist user/role:`, error);
    const embed = blacklistErrorEmbed("An error occurred while blacklisting.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageRoles"],
  botPermissions: ["ManageRoles", 'SendMessages', 'EmbedLinks'],
  deleted: false,
};