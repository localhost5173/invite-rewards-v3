import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PartialGroupDMChannel, PermissionFlagsBits, } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { GiveawayEmbedBuilder } from "../../utils/giveaways/GiveawayEmbedBuilder.js";
import { Embeds } from "../../utils/embeds/embeds.js";
export default async function (interaction) {
    if (!interaction.guild?.id || !interaction.channel?.id)
        return;
    try {
        const guild = interaction.guild;
        const guildId = guild.id;
        if (interaction.channel instanceof PartialGroupDMChannel) {
            return interaction.reply({
                embeds: [await Embeds.createEmbed(guildId, "general.noGroupDm")],
                ephemeral: true,
            });
        }
        if (!interaction.channel.isTextBased()) {
            return interaction.reply({
                embeds: [await Embeds.createEmbed(guildId, "general.textChannelOnly")],
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });
        const duration = interaction.options.getString("duration", true);
        const prize = interaction.options.getString("prize", true);
        const description = interaction.options.getString("description", true);
        const numberOfWinners = interaction.options.getInteger("winners", true);
        const rewardRole = interaction.options.getRole("reward-role", false);
        const inviteRequirement = interaction.options.getInteger("invite-requirement", false);
        if (numberOfWinners < 1 || numberOfWinners > 10) {
            return interaction.followUp({
                embeds: [
                    await Embeds.createEmbed(guildId, "giveaways.invalidNumberOfWinners"),
                ],
                ephemeral: true,
            });
        }
        const channelId = interaction.channel.id;
        const hostId = interaction.user.id;
        if (rewardRole) {
            const bot = guild.members.me;
            if (!bot)
                return cs.dev("Bot not found in guild while creating giveaway");
            if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return interaction.followUp({
                    embeds: [await Embeds.createEmbed(guildId, "roles.noPermissions", {
                            role: `<@&${rewardRole.id}>`,
                        })],
                    ephemeral: true,
                });
            }
            if (rewardRole.managed) {
                return interaction.followUp({
                    embeds: [
                        await Embeds.createEmbed(guildId, "roles.managedRoleAssignError", {
                            role: rewardRole.name,
                        }),
                    ],
                    ephemeral: true,
                });
            }
            if (bot.roles.highest.position <= rewardRole.position) {
                return interaction.followUp({
                    embeds: [
                        await Embeds.createEmbed(guildId, "roles.hierarchyRoleAssignError", {
                            role: rewardRole.name,
                        }),
                    ],
                    ephemeral: true,
                });
            }
        }
        const durationValue = parseInt(duration, 10);
        const durationUnit = duration.slice(durationValue.toString().length);
        const durationMs = {
            h: durationValue * 60 * 60 * 1000,
            d: durationValue * 24 * 60 * 60 * 1000,
            w: durationValue * 7 * 24 * 60 * 60 * 1000,
        }[durationUnit] ?? durationValue * 1000;
        const endTime = new Date(Date.now() + durationMs);
        const message = await interaction.channel.send({
            embeds: [
                await GiveawayEmbedBuilder.build(guildId, "creatingGiveaway", {}),
            ],
        });
        const giveawayId = await db.giveaways.createGiveaway({
            guildId,
            channelId,
            messageId: message.id,
            prize,
            description,
            hostId,
            endTime,
            numberOfWinners,
            inviteRequirement: inviteRequirement || undefined,
            rewardRoleId: rewardRole?.id,
        });
        const enterButton = new ButtonBuilder()
            .setCustomId("giveaway-enter:" + giveawayId)
            .setLabel("Enter Giveaway")
            .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(enterButton);
        const endTimeUnix = Math.floor(endTime.getTime() / 1000);
        const replacements = {
            description,
            prize,
            host: `<@${hostId}>`,
            timeLeft: `<t:${endTimeUnix}:R> <t:${endTimeUnix}:F>`,
            giveawayId: giveawayId.toString(),
            entries: "0",
            numberOfWinners: numberOfWinners.toString(),
        };
        const embed = await GiveawayEmbedBuilder.build(guildId, "giveawayNotEnded", replacements);
        if (rewardRole) {
            embed.addFields({
                name: "Reward Role",
                value: `<@&${rewardRole.id}>`,
                inline: true,
            });
        }
        if (inviteRequirement) {
            embed.addFields({
                name: "Invite Requirement",
                value: inviteRequirement.toString(),
                inline: true,
            });
        }
        await message.edit({
            embeds: [embed],
            components: [row],
        });
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, "giveaways.giveawayCreated"),
            ],
            ephemeral: true,
        });
    }
    catch (error) {
        cs.error(`Error creating giveaway: ${error}`);
        await Helpers.trySendCommandError(interaction);
    }
}
