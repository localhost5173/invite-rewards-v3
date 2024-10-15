import {
    ChatInputCommandInteraction,
    PartialGroupDMChannel,
    TextBasedChannel,
} from "discord.js";
import { getGiveaway, GiveawayData, setAsEnded } from "../../firebase/giveaways.ts";
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
        const giveaway = await getGiveaway(interaction.guildId, giveawayId) as GiveawayData | undefined;

        if (!giveaway || giveaway.channelId === undefined || giveaway.messageId === undefined) {
            throw new Error("Giveaway does not exist");
        }

        await setAsEnded(interaction.guildId, giveawayId);

        // Delete the giveaway message
        const channel = interaction.guild?.channels.cache.get(giveaway.channelId);
        const message = await (channel as TextBasedChannel).messages.fetch(giveaway.messageId);
        await message.delete();

        await interaction.followUp({
            content: "Giveaway deleted!",
            ephemeral: true,
        });

    } catch (error: any) {
        switch (error.message) {
            case "Giveaway does not exist":
                await interaction.followUp({
                    content: "The giveaway does not exist.",
                    ephemeral: true,
                });
                break;
            default:
                console.error("Error while deleting giveaway:" + error);
                await interaction.followUp({
                    content: "An error occurred while deleting the giveaway.",
                    ephemeral: true,
                });
                break;
        }
    }
}
