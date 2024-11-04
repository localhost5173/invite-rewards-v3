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

  try {
    cs.dev(`Setting embed for ${location} ${type} message`);
    await db.welcomer.removeEmbed(guildId, type, location);

    await interaction.reply({
      content: `The embed for the ${location} ${type} message has been removed.`,
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error removing embed: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}