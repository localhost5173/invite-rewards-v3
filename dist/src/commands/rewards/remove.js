import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
export default async function (interaction) {
    try {
        const rewardName = interaction.options.getString("name", true);
        await interaction.deferReply({ ephemeral: true });
        cs.dev("Removing reward: " + rewardName);
        const doesRewardExist = await db.rewards.doesRewardExist(interaction.guildId, rewardName);
        if (!doesRewardExist) {
            await interaction.followUp({
                embeds: [
                    await Embeds.createEmbed(interaction.guildId, "rewards.remove.notFound", {
                        rewardName,
                    }),
                ],
                ephemeral: true,
            });
            return;
        }
        await db.rewards.removeReward(interaction.guildId, rewardName);
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(interaction.guildId, "rewards.remove.success", {
                    rewardName,
                }),
            ],
            ephemeral: true,
        });
    }
    catch (error) {
        cs.error("Error while removing reward: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
