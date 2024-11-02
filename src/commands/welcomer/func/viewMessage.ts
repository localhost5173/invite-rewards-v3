import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm"
) {
  try {
    const guildId = interaction.guildId!;

    let message: string | null;

    if (type === "welcome") {
      message = await db.welcomer.getWelcomeMessage(guildId, location);
    } else {
      message = await db.welcomer.getFarewellMessage(guildId, location);
    }

    await interaction.reply({
      content: `${type} message for ${location}: ${message}`,
    });
  } catch (error) {
    cs.error(`Error while viewing ${type} message: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
