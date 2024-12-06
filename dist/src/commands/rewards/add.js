import { ActionRowBuilder, InteractionCollector, PermissionFlagsBits, TextInputStyle, } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
export default async function (interaction) {
    try {
        const guildId = interaction.guildId;
        const rewardName = interaction.options.getString("name", true);
        const inviteThreshold = interaction.options.getInteger("threshold", true);
        const type = interaction.options.getString("type", true);
        const role = interaction.options.getRole("role", false);
        const removable = interaction.options.getBoolean("removable", false);
        const storeFile = interaction.options.getAttachment("store", false);
        if (type !== "role" && role) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "rewards.add.roleNotRequired"),
                ],
                ephemeral: true,
            });
            return;
        }
        if (type !== "messageStore" && storeFile) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "rewards.add.storeNotRequired"),
                ],
                ephemeral: true,
            });
            return;
        }
        if (type !== "role" && removable) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "rewards.add.removableNotRequired"),
                ],
                ephemeral: true,
            });
            return;
        }
        const doesRewardExist = await db.rewards.doesRewardExist(guildId, rewardName);
        const rewards = await db.rewards.getRewards(guildId);
        if (doesRewardExist) {
            await interaction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "rewards.add.alreadyExists"),
                ],
                ephemeral: true,
            });
            return;
        }
        if (rewards.length >= 10) {
            await interaction.reply({
                embeds: [await Embeds.createEmbed(guildId, "rewards.add.maxReached")],
                ephemeral: true,
            });
            return;
        }
        switch (type) {
            case "role": {
                await handleRoleReward(interaction, guildId, inviteThreshold, rewardName, role, removable);
                break;
            }
            case "message":
                await handleMessageReward(interaction, guildId, inviteThreshold, rewardName);
                break;
            case "messageStore":
                await handleMessageStoreReward(interaction, guildId, inviteThreshold, rewardName, storeFile);
                break;
        }
    }
    catch (error) {
        cs.error("An error occurred while executing the reward view command: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
async function handleRoleReward(interaction, guildId, inviteThreshold, rewardName, role, removable) {
    if (!role) {
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "rewards.add.role.roleRequired"),
            ],
            ephemeral: true,
        });
        return;
    }
    const bot = interaction.guild.members.me;
    if (!bot)
        return cs.dev("Bot not found in guild while creating role reward");
    // Check if the bot has the necessary permissions
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.reply({
            embeds: [await Embeds.createEmbed(guildId, "rewards.noPermissions")],
            ephemeral: true,
        });
        return;
    }
    if (role.managed) {
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "roles.managedRoleAssignError"),
            ],
            ephemeral: true,
        });
        return;
    }
    if (bot.roles.highest.position <= role.position) {
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "roles.hierarchyRoleAssignError"),
            ],
            ephemeral: true,
        });
        return;
    }
    const roleId = role.id;
    // Add role reward to database
    await db.rewards.addRoleReward(guildId, inviteThreshold, rewardName, roleId, removable || false);
    await interaction.reply({
        embeds: [
            await Embeds.createEmbed(guildId, "rewards.add.role.success", {
                rewardName,
                role: `<@&${roleId}>`,
            }),
        ],
        ephemeral: true,
    });
}
async function handleMessageReward(interaction, guildId, inviteThreshold, rewardName) {
    // Open modal to get message
    const modal = await Embeds.createModal(guildId, "modals.rewards.add.message");
    modal.setCustomId("rewardMessageModal");
    const modalMessageField = await Embeds.createTextField(guildId, "modals.rewards.add.message.messageField");
    modalMessageField.setCustomId("messageField");
    modalMessageField.setRequired(true);
    modalMessageField.setStyle(TextInputStyle.Paragraph);
    modal.addComponents(new ActionRowBuilder().addComponents(modalMessageField));
    // Send modal
    await interaction.showModal(modal);
    // Get message from modal
    const filter = (i) => i.customId === "rewardMessageModal" && i.user.id === interaction.user.id;
    // Create a new collector
    const collector = new InteractionCollector(interaction.client, { filter, time: 15_000 });
    collector.on("collect", async (modalInteraction) => {
        const message = modalInteraction.fields.getTextInputValue("messageField");
        cs.log("Message: " + message);
        if (!message) {
            await modalInteraction.reply({
                embeds: [
                    await Embeds.createEmbed(guildId, "rewards.add.message.messageRequired"),
                ],
                ephemeral: true,
            });
            return;
        }
        // Add message reward to database
        await db.rewards.addMessageReward(guildId, inviteThreshold, rewardName, message);
        await modalInteraction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "rewards.add.message.success", {
                    rewardName,
                    message,
                }),
            ],
            ephemeral: true,
        });
    });
}
async function handleMessageStoreReward(interaction, guildId, inviteThreshold, rewardName, storeFile) {
    if (!storeFile) {
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "rewards.add.messageStore.fileRequired"),
            ],
            ephemeral: true,
        });
        return;
    }
    const storeSize = await db.rewards.getStoreSize(guildId, rewardName);
    if (storeSize > 1000) {
        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "rewards.add.messageStore.storeTooLarge"),
            ],
            ephemeral: true,
        });
        return;
    }
    await interaction.deferReply({ ephemeral: true });
    // Fetch the file content from the attachment URL
    const response = await fetch(storeFile.url);
    const textContent = await response.text();
    // Split the content by newlines to get an array of links
    const links = textContent
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean);
    if (links.length === 0) {
        return interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, "rewards.add.messageStore.fileEmpty"),
            ],
            ephemeral: true,
        });
    }
    await db.rewards.addMessageStoreReward(guildId, inviteThreshold, rewardName, links);
    await interaction.followUp({
        embeds: [
            await Embeds.createEmbed(guildId, "rewards.add.messageStore.success", {
                rewardName,
            }),
        ],
        ephemeral: true,
    });
}
