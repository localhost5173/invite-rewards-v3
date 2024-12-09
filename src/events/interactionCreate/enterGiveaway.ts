import { Interaction } from "discord.js";
import { Giveaways } from "../../utils/giveaways/Giveaways.js";
import { cs } from "../../utils/console/customConsole.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { db } from "../../utils/db/db.js";
import { UsageEvents } from "../../utils/db/models/usageModel.js";

export default async function (interaction: Interaction) {
  if (!interaction.guild) return;
  if (!interaction.channel) return;
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("giveaway-enter:")) return;

  try {
    const giveawayId = parseInt(interaction.customId.split(":")[1]);
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    if (
      !(await Giveaways.canUserEnterGiveaway(
        interaction.guild.id,
        giveawayId,
        userId
      ))
    ) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(interaction.guild.id, "giveaways.cannotEnterGiveaway")
        ],
        ephemeral: true,
      });
      return;
    }

    if (
      !(await Giveaways.isEnteredGiveaway(
        interaction.guild.id,
        giveawayId,
        userId
      ))
    ) {
      await Giveaways.enterGiveaway(interaction.guild.id, giveawayId, userId);
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(interaction.guild.id, "giveaways.enteredGiveaway")
        ],
        ephemeral: true,
      });
      db.usage.incrementUses(interaction.guild.id, UsageEvents.GiveawayEntry);
    } else {
      await Giveaways.leaveGiveaway(interaction.guild.id, giveawayId, userId);
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(interaction.guild.id, "giveaways.leftGiveaway")
        ],
        ephemeral: true,
      });
      db.usage.incrementUses(interaction.guild.id, UsageEvents.GiveawayLeave);
    }

    await Giveaways.updateEmbedEntries(interaction.guild.id, giveawayId);
  } catch (error) {
    cs.error("Error entering giveaway: " + error);
  }
}