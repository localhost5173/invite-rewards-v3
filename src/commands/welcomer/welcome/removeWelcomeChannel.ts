import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { db } from "../../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });

    await db.welcomer.removeWelcomeChannel(guildId);

    await interaction.editReply({
      content: `Welcome channel removed`,
    });
  } catch (error) {
    cs.error("Error while removing welcome channel: " + error);
  }
}
