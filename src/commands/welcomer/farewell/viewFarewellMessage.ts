import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  location: "server" | "dm"
) {
  try {
    const guildId = interaction.guildId!;
    const welcomeMessage = await db.welcomer.getWelcomeMessage(
      guildId,
      location
    );

    await interaction.reply({
      content: `Welcome message: ${welcomeMessage}`,
    });
  } catch (error) {
    cs.error("Error while viewing welcome message: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}