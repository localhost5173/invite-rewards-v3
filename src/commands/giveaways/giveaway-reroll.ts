import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";
import { db } from "../../utils/db/db";
import { Giveaways } from "../../utils/giveaways/Giveaways";

export default async function (interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;
    try {
        const giveawayId = parseInt(interaction.options.getString("id", true));

        const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);

        if (!giveaway) {
            await interaction.reply({
                content: "Giveaway not found",
                ephemeral: true,
            });

            return;
        }

        const isEnded = await db.giveaways.isEnded(guildId, giveawayId);

        if (!isEnded) {
            await interaction.reply({
                content: "Giveaway is still active",
                ephemeral: true,
            });

            return
        }

        await Giveaways.rerollWinners(guildId, giveawayId);

        await interaction.reply({
            content: "Giveaway rerolled",
            ephemeral: true,
        });
    } catch (error) {
        cs.error("Error while rerolling giveaway: "+ error);

        await Helpers.trySendCommandError(interaction);
    }
}