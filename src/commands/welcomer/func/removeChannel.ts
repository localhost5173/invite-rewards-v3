import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell"
) {
  const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (type === "welcome") {
      await db.welcomer.removeWelcomeChannel(guildId);
    } else {
      await db.welcomer.removeFarewellChannel(guildId);
    }

    await interaction.editReply({
      content: `${type} channel removed`,
    });
  } catch (error) {
    cs.error(`Error while removing ${type} channel: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}