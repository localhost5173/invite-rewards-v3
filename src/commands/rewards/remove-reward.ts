import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { removeReward } from "../../firebase/rewards.js";
import { removeRewardEmbed } from "../../utils/embeds/rewards.js";
import { devMode } from "../../index.js";

export default async function (interaction : ChatInputCommandInteraction) {
  const guildId = interaction.guild?.id;
  const count = interaction.options.getInteger("count");

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
  }

  if (!count) {
    return interaction.followUp({
      content: "You must provide a count for the reward.",
      ephemeral: true,
    });
  }

  try {
    await removeReward(guildId, count);
    const embed = removeRewardEmbed(count);
    return interaction.followUp({
      embeds: [embed],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Failed to delete reward: ", error);
    return interaction.followUp({
      content: "An error occurred while trying to delete the reward.",
      ephemeral: true,
    });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  deleted: false,
};
