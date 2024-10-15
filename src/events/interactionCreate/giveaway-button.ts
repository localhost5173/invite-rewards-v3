import { Interaction } from "discord.js";
import {
  canUserEnterGiveaway,
  enterGiveaway,
  getGiveaway,
  isEnteredGiveaway,
  leaveGiveaway,
} from "../../firebase/giveaways.js";
import { createGiveawayEmbed } from "../../utils/embeds/giveaways.js";

export default async function (interaction: Interaction) {
  if (!interaction.guild) return;
  if (!interaction.channel) return;
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("giveaway-enter:")) return;

  try {
    const giveawayId = interaction.customId.split(":")[1];
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    // Check if the user can enter the giveaway
    if (!await canUserEnterGiveaway(interaction.guild.id, giveawayId, userId)) {
      await interaction.followUp({
        content: "You cannot enter this giveaway.",
        ephemeral: true,
      });
      return;
    }

    //  Enter the or leave the giveaway
    if (!(await isEnteredGiveaway(interaction.guild.id, giveawayId, userId))) {
      enterGiveaway(interaction.guild.id, giveawayId, userId);
      await interaction.followUp({
        content: "You have entered the giveaway!",
        ephemeral: true,
      });
    } else {
      leaveGiveaway(interaction.guild.id, giveawayId, userId);
      await interaction.followUp({
        content: "You have left the giveaway! Are you sure about this?",
        ephemeral: true,
      });
    }

    // Update the giveaway embed entries
    const giveaway = await getGiveaway(interaction.guild.id, giveawayId);
    if (!giveaway) return;

    const message = await interaction.channel.messages.fetch(
      giveaway.messageId
    );

    await message.edit({
      embeds: [
        createGiveawayEmbed(
          giveaway.prize,
          giveaway.description,
          giveaway.winners,
          giveaway.endTime.toDate(),
          giveaway.hostId,
          giveaway.giveawayId.toString(),
          giveaway.entries.length,
          giveaway.inviteRequirement,
          giveaway.rewardRoleId
        ),
      ],
    });
  } catch (error) {
    console.error("Error entering giveaway:", error);
  }
}
