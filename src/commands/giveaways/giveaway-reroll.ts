import { ChannelType, ChatInputCommandInteraction } from "discord.js";
import { getGiveaway, GiveawayData, rerollGiveaway } from "../../firebase/giveaways.js";

export default async function (interaction : ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const giveawayId = interaction.options.getString("id", true);

    try {
        await interaction.deferReply({ ephemeral: true });

        const giveaway = await getGiveaway(interaction.guild.id, giveawayId) as GiveawayData;

        if (!giveaway.ended) {
            await interaction.followUp({
                content: "This giveaway has not ended yet",
                ephemeral: true,
            });
            return;
        }

        if (!giveaway.channelId) {
            await interaction.followUp({
                content: "Giveaway channel not found",
                ephemeral: true,
            });
            return
        }

        if (!giveaway.messageId) {
            await interaction.followUp({
                content: "Giveaway message ID not found",
                ephemeral: true,
            });
            return;
        }

        const channel = await interaction.guild.channels.fetch(giveaway.channelId);

        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.followUp({
                content: "Giveaway channel is not a text channel",
                ephemeral: true,
            });
            return;
        }

        const newWinners = await rerollGiveaway(interaction.guild.id, giveawayId);

        // Send a message to the giveaway channel announcing the new winner
        if (newWinners.length) {
        channel.send(`Giveaway Reroll! Congratulations <@${newWinners.join(">, <@")}>! You have won the rerolled giveaway for ${giveaway.prize}!`);
        } else {
            channel.send(`Giveaway Reroll! No one entered the rerolled giveaway for ${giveaway.prize}.`);
        }

        await interaction.followUp({
            content: "Giveaway has been rerolled!",
        });
    } catch (error: any) {
        switch (error.message) {
            case "Giveaway does not exist":
                await interaction.followUp({
                    content: "Giveaway does not exist",
                    ephemeral: true,
                });
                break;
            default:
                console.error("Error while rerollign giveaway", error);
                await interaction.followUp({
                    content: "An error occurred while rerolling the giveaway",
                    ephemeral: true,
                });
                break;
        }
    }
}