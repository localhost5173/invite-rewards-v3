import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";

export default async function (interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });

    await db.welcomer.removeFarewellChannel(guildId);

    await interaction.editReply({
      content: `Farewell channel removed`,
    });
  } catch (error) {
    cs.error("Error while removing farewell channel: " + error);
  }
}