import { Interaction } from "discord.js";
import { Giveaways } from "../../utils/giveaways/Giveaways";
import { cs } from "../../utils/console/customConsole";

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
        content: "You cannot enter this giveaway.",
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
        content: "You have entered the giveaway!",
        ephemeral: true,
      });
    } else {
      Giveaways.leaveGiveaway(interaction.guild.id, giveawayId, userId);
      await interaction.followUp({
        content: "You have left the giveaway! Are you sure about this?",
        ephemeral: true,
      });
    }

    await Giveaways.updateEmbedEntries(interaction.guild.id, giveawayId);
  } catch (error) {
    cs.error("Error entering giveaway: " + error);
  }
}