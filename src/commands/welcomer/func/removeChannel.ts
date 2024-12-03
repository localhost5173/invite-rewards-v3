import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell"
) {
  const guildId = interaction.guildId!;

  try {
    await interaction.deferReply({ ephemeral: true });
    cs.dev(`Removing ${type} channel`);

    if (type === "welcome") {
      await db.welcomer.removeWelcomeChannel(guildId);
    } else {
      await db.welcomer.removeFarewellChannel(guildId);
    }

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          guildId,
          `welcomer.removeChannel.${type}.success`
        ),
      ],
    });
  } catch (error) {
    cs.error(`Error while removing ${type} channel: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
