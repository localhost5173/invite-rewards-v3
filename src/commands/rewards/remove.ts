import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const rewardName = interaction.options.getString("name", true);
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });
    cs.dev("Removing reward: " + rewardName);

    const doesRewardExist = await db.rewards.doesRewardExist(
      guildId,
      rewardName
    );

    if (!doesRewardExist) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "rewards.remove.notFound",
            {
              rewardName,
            }
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const rewardType = await db.rewards.getRewardType(guildId, rewardName);
    await db.rewards.removeReward(guildId, rewardName);
    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          guildId,
          "rewards.remove.success",
          {
            rewardName,
          }
        ),
      ],
      ephemeral: true,
    });

    switch (rewardType) {
      case "role":
        db.usage.incrementUses(guildId, UsageCommands.RewardRemoveRole);
        break;
      case "message":
        db.usage.incrementUses(guildId, UsageCommands.RewardRemoveMessage);
        break;
      case "messageStore":
        db.usage.incrementUses(guildId, UsageCommands.RewardRemoveMessageStore);
        break;
      default:
        break;
    }
  } catch (error) {
    cs.error("Error while removing reward: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
