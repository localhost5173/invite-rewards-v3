import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { EmbedBuilder } from "discord.js";
import { placeholdersEmbed, placeholdersErrorEmbed } from "../utils/embeds/system.js";
import { devMode } from "../index.js";

export const data: CommandData = {
  name: "placeholders",
  description:
    "See all the placeholders that can be used in invite messages and embeds",
};

export async function run({ interaction }: SlashCommandProps) {
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    const embed = placeholdersErrorEmbed("This command can only be used in a guild.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  const placeholders = [
    { name: "`{mention-user}`", description: "Mentions the invited user" },
    { name: "`{username}`", description: "The username of the invited user" },
    { name: "`{user-tag}`", description: "The tag of the invited user" },
    { name: "`{server-name}`", description: "The name of the server" },
    { name: "`{member-count}`", description: "The total member count of the server" },
    { name: "`{inviter-tag}`", description: "The tag of the inviter" },
    { name: "`{inviter-count}`", description: "The total invite count of the inviter" },
    { name: "`{inviter-real-count}`", description: "The real invite count of the inviter" },
    { name: "`{inviter-fake-count}`", description: "The fake invite count of the inviter" },
  ];
  
  const embed = placeholdersEmbed(placeholders);
  interaction.followUp({ embeds: [embed], ephemeral: true });
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};