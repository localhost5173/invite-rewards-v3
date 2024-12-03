import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Giveaways } from "../../utils/giveaways/Giveaways.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";

export default async function (interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;
  try {
    const giveawayId = parseInt(interaction.options.getString("id", true));

    const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);

    if (!giveaway) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "giveaways.giveawayNotFound", {
            giveawayId: giveawayId.toString(),
          }),
        ],
        ephemeral: true,
      });

      return;
    }

    const isEnded = await db.giveaways.isEnded(guildId, giveawayId);

    if (isEnded) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "giveaways.giveawayAlreadyEnded", {
            giveawayId: giveawayId.toString(),
          }),
        ],
        ephemeral: true,
      });

      return;
    }

    await Giveaways.endGiveaway(guildId, giveaway);

    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "giveaways.giveawayEndedReply", {
          giveawayId: giveawayId.toString(),
        }),
      ],
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error while ending giveaway" + error);

    await Helpers.trySendCommandError(interaction);
  }
}
