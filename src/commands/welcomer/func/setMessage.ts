import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {
  const guildId = interaction.guildId!;
  const message = interaction.options.getString("message", true);

  try {
    await interaction.deferReply({ ephemeral: true });

    if (type === "welcome") {
      await db.welcomer.setWelcomeMessage(guildId, message, location);
    } else {
      await db.welcomer.setFarewellMessage(guildId, message, location);
    }

    await interaction.followUp({
      content: `${location} ${type} message set to: ${message}`,
    });
  } catch (error) {
    cs.error(`Error while setting ${type} message: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
