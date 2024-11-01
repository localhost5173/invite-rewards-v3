import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { db } from "../../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction, location: "server" | "dm") {
  const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });

    await db.welcomer.removeWelcomeMessage(guildId, location);

    await interaction.editReply({
      content: `Welcome message removed`,
    });
  } catch (error) {
    cs.error("Error while removing welcome message: " + error);
  }
}
