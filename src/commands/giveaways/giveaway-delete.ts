import {
  ChatInputCommandInteraction,
  PartialGroupDMChannel,
  TextBasedChannel,
} from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;
  if (!interaction.channel) return;

  try {
    const guildId = interaction.guildId;

    if (interaction.channel instanceof PartialGroupDMChannel) {
      return interaction.reply({
        embeds: [await Embeds.createEmbed(guildId, "general.noGroupDm")],
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
        embeds: [
          await Embeds.createEmbed(guildId, "giveaways.giveawayDoesntExist", {
            giveawayId,
          }),
        ],
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
      embeds: [
        await Embeds.createEmbed(guildId, "giveaways.giveawayDeleted", {
          giveawayId,
        }),
      ],
      ephemeral: true,
    });
    db.usage.incrementUses(guildId, UsageCommands.GiveawayDelete);
  } catch (error) {
    cs.error("Error in giveaway delete command:" + error);
    await Helpers.trySendCommandError(interaction);
  }
}
