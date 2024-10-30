import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;

    await db.verification.disable(guildId);

    await interaction.reply({
      content: "The verification system has been removed.",
      ephemeral: true,
    });
  } catch (error: unknown) {
    cs.error("Error while removing the verification system: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
