import type {
    CommandData,
    SlashCommandProps,
    CommandOptions,
} from "commandkit";
import { Embeds } from "../utils/embeds/embeds.js";
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, PartialGroupDMChannel } from "discord.js";
import { db } from "../utils/db/db.js";
import { devMode } from "../index.js";
import { UsageCommands } from "../utils/db/models/usageModel.js";

export const data: CommandData = {
    name: "data",
    description: "Deletes all the data for this server from the database. WARNING: This action is irreversible.",
    options: [
        {
            name: "delete",
            description: "Deletes all the data for this server from the database. WARNING: This action is irreversible.",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "all",
                    description: "Deletes all the data for this server from the database. WARNING: This action is irreversible.",
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ],
        },
    ],
};

export async function run({ interaction }: SlashCommandProps) {
    try {
        const guildId = interaction.guildId!;

        // Check if user is server owner
        const guildOwnerId = interaction.guild!.ownerId;
        const channel = interaction.channel;

        if (channel instanceof PartialGroupDMChannel) {
            return interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "general.noGroupDm"),
                ],
                ephemeral: true,
            });
        }

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "general.textChannelOnly"),
                ],
                ephemeral: true,
            });
        }

        if (interaction.user.id !== guildOwnerId) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "deleteAll.notOwner"),
                ],
                ephemeral: true,
            });
            return;
        }

        // Are you sure confirmation using buttons
        const confirmTranslation = await Embeds.getStringTranslation(guildId, "deleteAll.translations.confirm");
        const discardTranslation = await Embeds.getStringTranslation(guildId, "deleteAll.translations.discard");

        const confirmButton = new ButtonBuilder()
            .setCustomId("confirmDeleteAll")
            .setLabel(confirmTranslation)
            .setStyle(ButtonStyle.Danger);

        const discardButton = new ButtonBuilder()
            .setCustomId("discardDeleteAll")
            .setLabel(discardTranslation)
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, discardButton);

        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "deleteAll.confirmation"),
            ],
            components: [row],
            ephemeral: true,
        });

        // Wait for user to confirm

        const filter = (i: ButtonInteraction) =>
            (i.customId === "confirmDeleteAll" || i.customId === "discardDeleteAll") &&
            i.user.id === interaction.user.id;

        const collector = channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 15_000,
        });

        collector.on("collect", async (i) => {
            if (i.customId === "confirmDeleteAll") {
                await i.update({
                    embeds: [
                        await Embeds.createEmbed(guildId, "deleteAll.deleting"),
                    ],
                    components: [],
                });

                await db.deleteAllData(guildId);

                await i.followUp({
                    embeds: [
                        await Embeds.createEmbed(guildId, "deleteAll.success"),
                    ],
                });

                db.usage.incrementUses(guildId, UsageCommands.DataDeleteAll);
            } else if (i.customId === "discardDeleteAll") {
                await i.update({
                    embeds: [
                        await Embeds.createEmbed(guildId, "deleteAll.discard"),
                    ],
                    components: [],
                });
            }
        });

        collector.on("end", async () => {
            await interaction.editReply({
                embeds: [
                    await Embeds.createEmbed(guildId, "general.interactionTimedOut"),
                ],
                components: [],
            });
        });
    } catch (error) {
        cs.error("An error occurred while trying to delete all data for a server: " + error);

        await Helpers.trySendCommandError(interaction);
    }
}

export const options: CommandOptions = {
    devOnly: false,
    userPermissions: ["Administrator"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};