import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";
import { Embeds } from "../../../utils/embeds/embeds";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {
  const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (type === "welcome") {
      await db.welcomer.removeWelcomeMessage(guildId, location);
    } else {
      await db.welcomer.removeFarewellMessage(guildId, location);
    }

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          guildId,
          `welcomer.removeEmbed.${type}.${location}.success`
        ),
      ],
    });
  } catch (error) {
    cs.error(`Error while removing ${type} message: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
