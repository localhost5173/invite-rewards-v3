import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { removeVerification } from "../../firebase/verification.js";
import { errorEmbed, successEmbed } from "../../utils/embeds/verification.js";
import { devMode } from "../../index.js";
import { ChatInputCommandInteraction } from "discord.js";

export const data: CommandData = {
  name: "remove-verification",
  description: "Removes the verification system from the server",
};

export default async function (interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp("This command can only be used in a guild.");
  }

  try {
    await removeVerification(guildId);
    interaction.followUp({
      embeds: [successEmbed("Verification removed successfully")],
    });
  } catch (error) {
    interaction.followUp({
      embeds: [
        errorEmbed(
          "An error occurred while setting up the verification system."
        ),
      ],
    });
    console.error("Error occured while removing verification: ", error);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};
