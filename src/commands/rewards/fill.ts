import { ChatInputCommandInteraction } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;
    const rewardName = interaction.options.getString("name", true);
    const storeFile = interaction.options.getAttachment("store", true);

    await interaction.deferReply({ ephemeral: true });

    const doesRewardExist = await db.rewards.doesRewardExist(
      guildId,
      rewardName
    );

    if (!doesRewardExist) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(guildId, "rewards.fill.noRewardFound", {
            rewardName,
          }),
        ],
        ephemeral: true,
      });
      return;
    }

    const isStore = await db.rewards.isStore(guildId, rewardName);

    if (!isStore) {
      await interaction.followUp({
        embeds: [await Embeds.createEmbed(guildId, "rewards.fill.notStore")],
        ephemeral: true,
      });
      return;
    }

    const storeSize = await db.rewards.getStoreSize(guildId, rewardName);

    if (storeSize > 1000) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "rewards.add.messageStore.storeTooLarge"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    // Fetch the file content from the attachment URL
    const response = await fetch(storeFile.url);
    const textContent = await response.text();

    // Split the content by newlines to get an array of links
    const links = textContent
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    if ((storeSize + links.length) > 1000) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "rewards.add.messageStore.storeTooLarge"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (links.length === 0) {
      return interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "rewards.add.messageStore.fileEmpty"
          ),
        ],
        ephemeral: true,
      });
    }

    await db.rewards.fillStore(guildId, rewardName, links);

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "rewards.fill.success", {
          rewardName,
        }),
      ],
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error while removing reward: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
