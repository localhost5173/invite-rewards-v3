import {
  ChatInputCommandInteraction,
  PartialGroupDMChannel,
  TextBasedChannel,
} from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;
  if (!interaction.channel) return;

  try {
    if (interaction.channel instanceof PartialGroupDMChannel) {
      return interaction.reply({
        content: "This command is not available in group DMs.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const giveawayId = interaction.options.getString("id", true);

    // Set the giveaway as ended in Firestore
    const giveaway = await db.giveaways.getGiveaway(
      interaction.guildId,
      parseInt(giveawayId)
    );

    if (
      !giveaway ||
      giveaway.channelId === undefined ||
      giveaway.messageId === undefined
    ) {
      return interaction.followUp({
        content: "The giveaway does not exist.",
        ephemeral: true,
      });
    }

    await db.giveaways.setAsEnded(interaction.guildId, parseInt(giveawayId));

    // Delete the giveaway message
    const channel =
      interaction.guild?.channels.cache.get(giveaway.channelId) ||
      interaction.guild?.channels.fetch(giveaway.channelId);
    const message = await (channel as TextBasedChannel).messages.fetch(
      giveaway.messageId
    );
    await message.delete();

    await interaction.followUp({
      content: "Giveaway deleted!",
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error in giveaway delete command:" + error);
    await Helpers.trySendCommandError(interaction);
  }
}
