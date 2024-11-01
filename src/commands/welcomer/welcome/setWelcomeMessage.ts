import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { db } from "../../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction, location: "server" | "dm") {
  const guildId = interaction.guildId!;
  const message = interaction.options.getString("message", true);

  try {
    await interaction.deferReply({ ephemeral: true });

    await db.welcomer.setWelcomeMessage(guildId, message, location);

    await interaction.editReply({
      content: `Welcome message set to: ${message}`,
    });
  } catch (error) {
    cs.error("Error while setting welcome message: " + error);
  }
}
