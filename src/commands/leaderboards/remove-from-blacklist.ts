import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { removeFromBlacklist } from "../../firebase/leaderboards.js"; // Utility functions
import updateBlacklistLeaderboards from "../../utils/leaderboards/updateBlacklistLeaderboards.js";
import { removeFromBlacklistErrorEmbed, removeFromBlacklistSuccessEmbed } from "../../utils/embeds/leaderboards.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "remove-from-blacklist",
  description: "Remove a user or role from the blacklist.",
  options: [
    {
      name: "type",
      description:
        "The type of entity to remove from the blacklist (user or role)",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "user", value: "user" },
        { name: "role", value: "role" },
      ],
    },
    {
      name: "user",
      description: "The user to remove from the blacklist",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "role",
      description: "The role to remove from the blacklist",
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
    const embed = removeFromBlacklistErrorEmbed(
      "Please provide a valid user to remove from the blacklist."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (type === "role" && !role) {
    const embed = removeFromBlacklistErrorEmbed(
      "Please provide a valid role to remove from the blacklist."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!guildId) {
    const embed = removeFromBlacklistErrorEmbed("This command can only be used in a guild.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  const idToRemove = type === "user" ? user?.id : role?.id;

  if (!idToRemove) {
    const embed = removeFromBlacklistErrorEmbed("Invalid ID provided.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  try {
    await removeFromBlacklist(guildId, idToRemove, type as any);
    await updateBlacklistLeaderboards(guildId);
    const embed = removeFromBlacklistSuccessEmbed(
      `Successfully removed ${
        type === "user" ? "user" : "role"
      } from the blacklist.`
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Failed to remove from blacklist:", error);
    const embed = removeFromBlacklistErrorEmbed(
      "An error occurred while removing from the blacklist."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageRoles"],
  botPermissions: ["ManageRoles", 'SendMessages', 'EmbedLinks'],
  deleted: false,
};