import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";

export default async function (interaction: ChatInputCommandInteraction, location: "server" | "dm") {
  const guildId = interaction.guildId!;
  const message = interaction.options.getString("message", true);

  try {
    await interaction.deferReply({ ephemeral: true });

    await db.welcomer.setFarewellMessage(guildId, message, location);

    await interaction.editReply({
      content: `${location} Farewell message set to: ${message}`,
    });
  } catch (error) {
    cs.error("Error while setting farewell message: " + error);
  }
}