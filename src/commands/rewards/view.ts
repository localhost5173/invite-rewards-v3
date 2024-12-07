import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });

    const rewards = await db.rewards.getRewards(guildId);

    if (!rewards.length) {
      await interaction.followUp({
        embeds: [
          await Embeds.createEmbed(guildId, "rewards.view.noRewards"),
        ],
        ephemeral: true,
      });
      return;
    }

    const language = await db.languages.getLanguage(guildId);
    const data = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });
    const languageData = data.default;

    const invitesTranslation =
      languageData.leaderboards.update.invitesTranslation;

    const rewardsString = rewards.map((reward) => {
      if (reward.rewardType === "messageStore") {
        const storeSize = reward.messageStore ? reward.messageStore.length : 0;
        return `**${reward.rewardName}** [${reward.rewardType} [${storeSize}]] - ${invitesTranslation}`;
      }
      return `**${reward.rewardName}** [${reward.rewardType}] - ${reward.inviteThreshold} ${invitesTranslation}`;
    });

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "rewards.view.success", {
          rewards: rewardsString.join("\n"),
        }),
      ],
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error while removing reward: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
