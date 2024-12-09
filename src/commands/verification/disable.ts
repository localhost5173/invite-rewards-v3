import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;

    await db.verification.disable(guildId);

    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "verification.disable.success"),
      ],
      ephemeral: true,
    });
    db.usage.incrementUses(guildId, UsageCommands.VerificationDisable);
  } catch (error: unknown) {
    cs.error("Error while removing the verification system: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
