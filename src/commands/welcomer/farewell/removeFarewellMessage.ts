import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";

export default async function (interaction: ChatInputCommandInteraction, location: "server" | "dm") {
    const guildId = interaction.guildId!;

    try {
      await interaction.deferReply({ ephemeral: true });
  
      await db.welcomer.removeFarewellMessage(guildId, location);
  
      await interaction.editReply({
        content: `Farewell message removed`,
      });
    } catch (error) {
      cs.error("Error while removing farewell message: " + error);
    }
}