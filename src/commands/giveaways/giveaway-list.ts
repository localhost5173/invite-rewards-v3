import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PartialGroupDMChannel,
} from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guildId!;
    try {
        const guildGiveaways = await db.giveaways.getGuildGiveaways(guildId);

        if (!guildGiveaways.length) {
            await interaction.reply({
                content: "No giveaways found",
                ephemeral: true,
            });
            return;
        }

        if (interaction.channel instanceof PartialGroupDMChannel) {
            await interaction.reply({
                content: "This command is not available in group DMs",
                ephemeral: true,
            });
            return;
        }

        let currentPage = 0;
        let showActiveOnly = true;

        const filterGiveaways = (activeOnly: boolean) =>
            guildGiveaways.filter((giveaway) => (activeOnly ? !giveaway.ended : giveaway.ended));

        const filteredGiveaways = () => filterGiveaways(showActiveOnly);

        const createNoGiveawaysEmbed = () => {
            const description = showActiveOnly
                ? "No active giveaways found."
                : "No ended giveaways found.";
            return new EmbedBuilder().setDescription(description).setColor("Red");
        };

        // Helper to create embed for a specific page
        const createGiveawayEmbed = async (index: number) => {
            const giveaways = filteredGiveaways();
            const giveaway = giveaways[index];
            if (!giveaway) return null;

            const endTimeUnix = Math.floor(giveaway.endTime.getTime() / 1000);
            const replacements = {
                prize: giveaway.prize,
                hostId: giveaway.hostId,
                endTime: endTimeUnix.toString(),
                numberOfWinners: giveaway.numberOfWinners.toString(),
                entries: giveaway.entries.length.toString(),
                giveawayId: giveaway.giveawayId.toString(),
                status: giveaway.ended ? "Ended" : "Active",
                description: giveaway.description,
            };

            return await Embeds.createEmbed(guildId, "giveaways.giveawayPage", replacements);
        };

        const updateEmbedMessage = async (
            interaction: ButtonInteraction | ChatInputCommandInteraction,
            page: number
        ) => {
            const giveaways = filteredGiveaways();

            let embed;
            if (giveaways.length === 0) {
                embed = createNoGiveawaysEmbed();
            } else {
                currentPage = Math.max(0, Math.min(page, giveaways.length - 1));
                embed = await createGiveawayEmbed(currentPage);
            }

            const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("giveaway-previous")
                    .setLabel("◀")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(giveaways.length === 0 || currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("giveaway-next")
                    .setLabel("▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(giveaways.length === 0 || currentPage === giveaways.length - 1),
                new ButtonBuilder()
                    .setCustomId("giveaway-previous10")
                    .setLabel("⏪")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(giveaways.length === 0 || currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("giveaway-next10")
                    .setLabel("⏩")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(giveaways.length === 0 || currentPage === giveaways.length - 1),
                new ButtonBuilder()
                    .setCustomId("giveaway-toggle-status")
                    .setLabel(showActiveOnly ? "Show Ended" : "Show Active")
                    .setStyle(ButtonStyle.Success)
            );

            if (embed) {
                await interaction.editReply({
                    embeds: [embed],
                    components: [buttons],
                });
            }
        };

        // Initial reply
        await interaction.deferReply({ ephemeral: true });
        await updateEmbedMessage(interaction, currentPage);

        // Button interaction handler
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 2 * 60 * 1000, // 2-minute timeout
        });

        collector?.on("collect", async (i) => {
            try {
                await i.deferUpdate();
                if (!i.isButton()) return;

                switch (i.customId) {
                    case "giveaway-previous":
                        await updateEmbedMessage(i, currentPage - 1);
                        break;
                    case "giveaway-next":
                        await updateEmbedMessage(i, currentPage + 1);
                        break;
                    case "giveaway-previous10":
                        await updateEmbedMessage(i, currentPage - 10);
                        break;
                    case "giveaway-next10":
                        await updateEmbedMessage(i, currentPage + 10);
                        break;
                    case "giveaway-toggle-status":
                        showActiveOnly = !showActiveOnly;
                        currentPage = 0; // Reset to the first page
                        await updateEmbedMessage(i, currentPage);
                        break;
                }
            } catch (error) {
                cs.error("Error handling button interaction: " + error);
            }
        });

        collector?.on("end", async () => {
            try {
                await interaction.editReply({
                    content: "Interaction ended. Please re-run the command to interact again.",
                    components: [],
                });
            } catch {
                // Ignore errors when editing expired messages
            }
        });
    } catch (error) {
        cs.error("Error while fetching giveaways: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
