import { PermissionFlagsBits } from "discord.js";
import { client } from "../../index.js";
import { db } from "../db/db.js";
import { cs } from "../console/customConsole.js";
import { GiveawayEmbedBuilder } from "./GiveawayEmbedBuilder.js";
import { Embeds } from "../embeds/embeds.js";
export class Giveaways {
    static async canUserEnterGiveaway(guildId, giveawayId, userId) {
        const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
        if (!giveaway)
            return false;
        if (giveaway.ended)
            return false;
        const userInvites = await db.invites.userInvites.getRealAndBonusInvites(guildId, userId, "alltime");
        if (!giveaway.inviteRequirement)
            return true;
        if (giveaway.inviteRequirement > userInvites)
            return false;
        return true;
    }
    static async rerollWinners(guildId, giveawayId) {
        const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
        if (!giveaway)
            return;
        const winners = [];
        const entries = [...giveaway.entries]; // Create a copy of the entries array
        // Ensure winners don't exceed the number of entries
        const numberOfWinners = Math.min(giveaway.numberOfWinners, entries.length);
        for (let i = 0; i < numberOfWinners; i++) {
            const randomIndex = Math.floor(Math.random() * entries.length);
            const winner = entries.splice(randomIndex, 1)[0]; // Remove the selected winner from the entries array
            winners.push(winner);
        }
        // Mark giveaway as ended and save winners
        await db.giveaways.setWinners(guildId, giveawayId, winners);
        // Announce winners
        await announceWinners(giveaway, winners, true);
    }
    static async isEnteredGiveaway(guildId, giveawayId, userId) {
        const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
        if (!giveaway)
            return false;
        return giveaway.entries.includes(userId);
    }
    static async enterGiveaway(guildId, giveawayId, userId) {
        await db.giveaways.enterGiveaway(guildId, giveawayId, userId);
    }
    static async leaveGiveaway(guildId, giveawayId, userId) {
        await db.giveaways.leaveGiveaway(guildId, giveawayId, userId);
    }
    static async updateEmbedEntries(guildId, giveawayId) {
        const giveaway = await db.giveaways.getGiveaway(guildId, giveawayId);
        if (!giveaway)
            return;
        const guild = client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));
        const channel = (guild.channels.cache.get(giveaway.channelId) ||
            (await guild.channels.fetch(giveaway.channelId)));
        if (!channel)
            return;
        const message = await channel.messages.fetch(giveaway.messageId);
        // Prepare replacement data
        const endTimeUnix = Math.floor(giveaway.endTime.getTime() / 1000);
        const replacements = {
            description: giveaway.description,
            prize: giveaway.prize,
            host: `<@${giveaway.hostId}>`,
            timeLeft: `<t:${endTimeUnix}:R> <t:${endTimeUnix}:F>`,
            giveawayId: giveawayId.toString(),
            entries: giveaway.entries.length.toString(),
            numberOfWinners: giveaway.numberOfWinners.toString(),
        };
        // Build the embed
        const embed = await GiveawayEmbedBuilder.build(guildId, "giveawayNotEnded", replacements);
        // Add fields dynamically
        if (giveaway.rewardRoleId) {
            const rewardRole = guild.roles.cache.get(giveaway.rewardRoleId) ||
                (await guild.roles.fetch(giveaway.rewardRoleId));
            if (rewardRole) {
                embed.addFields({
                    name: "Reward Role",
                    value: `<@&${rewardRole.id}>`,
                    inline: true,
                });
            }
        }
        if (giveaway.inviteRequirement) {
            embed.addFields({
                name: "Invite Requirement",
                value: giveaway.inviteRequirement.toString(),
                inline: true,
            });
        }
        await message.edit({ embeds: [embed] });
    }
    static async checkForEndedGiveaways() {
        const giveawaysToEnd = await db.giveaways.getGiveawaysToEnd();
        for (const giveaway of giveawaysToEnd) {
            cs.dev("Ending giveaway: " + giveaway.giveawayId);
            const winners = [];
            const entries = [...giveaway.entries]; // Create a copy of the entries array
            // Ensure winners don't exceed the number of entries
            const numberOfWinners = Math.min(giveaway.numberOfWinners, entries.length);
            for (let i = 0; i < numberOfWinners; i++) {
                const randomIndex = Math.floor(Math.random() * entries.length);
                const winner = entries.splice(randomIndex, 1)[0]; // Remove the selected winner from the entries array
                winners.push(winner);
            }
            // Mark giveaway as ended and save winners
            await db.giveaways.setAsEnded(giveaway.guildId, giveaway.giveawayId);
            await db.giveaways.setWinners(giveaway.guildId, giveaway.giveawayId, winners);
            // Announce winners
            await announceWinners(giveaway, winners);
        }
    }
    static async endGiveaway(guildId, giveaway) {
        const winners = [];
        const entries = [...giveaway.entries]; // Create a copy of the entries array
        // Ensure winners don't exceed the number of entries
        const numberOfWinners = Math.min(giveaway.numberOfWinners, entries.length);
        for (let i = 0; i < numberOfWinners; i++) {
            const randomIndex = Math.floor(Math.random() * entries.length);
            const winner = entries.splice(randomIndex, 1)[0]; // Remove the selected winner from the entries array
            winners.push(winner);
        }
        // Mark giveaway as ended and save winners
        await db.giveaways.setAsEnded(giveaway.guildId, giveaway.giveawayId);
        await db.giveaways.setWinners(giveaway.guildId, giveaway.giveawayId, winners);
        // Announce winners
        await announceWinners(giveaway, winners, false, true);
    }
}
async function announceWinners(giveaway, winners, reroll = false, endTimeNow = false) {
    cs.log(winners);
    const guild = client.guilds.cache.get(giveaway.guildId) ||
        (await client.guilds.fetch(giveaway.guildId));
    const channel = (guild.channels.cache.get(giveaway.channelId) ||
        (await guild.channels.fetch(giveaway.channelId)));
    if (!channel)
        return;
    const message = await channel.messages.fetch(giveaway.messageId);
    let endTimeUnix = Math.floor(giveaway.endTime.getTime() / 1000);
    if (endTimeNow) {
        endTimeUnix = Math.floor(Date.now() / 1000);
    }
    const winnersString = winners.map((winner) => `<@${winner}>`).join(", ") || "No winners";
    const replacements = {
        description: giveaway.description,
        prize: giveaway.prize,
        host: `<@${giveaway.hostId}>`,
        endedTimestamp: `<t:${endTimeUnix}:R> <t:${endTimeUnix}:F>`,
        entries: giveaway.entries.length.toString(),
        giveawayId: giveaway.giveawayId.toString(),
        winners: winnersString,
    };
    const embed = await GiveawayEmbedBuilder.build(giveaway.guildId, "giveawayEnded", replacements);
    if (giveaway.rewardRoleId) {
        const rewardRole = guild.roles.cache.get(giveaway.rewardRoleId) ||
            (await guild.roles.fetch(giveaway.rewardRoleId));
        if (rewardRole) {
            embed.addFields({
                name: "Reward Role",
                value: `<@&${rewardRole.id}>`,
                inline: true,
            });
        }
    }
    if (giveaway.inviteRequirement) {
        embed.addFields({
            name: "Invite Requirement",
            value: giveaway.inviteRequirement.toString(),
            inline: true,
        });
    }
    await message.edit({ embeds: [embed] });
    const mentionWinners = winners.map((winner) => `<@${winner}>`).join(", ");
    if (winners.length !== 0 && !reroll) {
        await channel.send({
            embeds: [
                await Embeds.createEmbed(giveaway.guildId, "giveaways.giveawayWon", {
                    prize: giveaway.prize,
                    mentionWinners: mentionWinners,
                })
            ]
        });
    }
    if (winners.length !== 0 && reroll) {
        await channel.send({
            embeds: [
                await Embeds.createEmbed(giveaway.guildId, "giveaways.giveawayRerolledWon", {
                    prize: giveaway.prize,
                    mentionWinners: mentionWinners,
                })
            ]
        });
    }
    if (giveaway.rewardRoleId) {
        for (const winner of winners) {
            await giveRewardRole(giveaway.guildId, winner, giveaway.rewardRoleId);
        }
    }
}
async function giveRewardRole(guildId, userId, rewardRoleId) {
    const guild = client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));
    const member = await guild.members.fetch(userId);
    const rewardRole = guild.roles.cache.get(rewardRoleId) || (await guild.roles.fetch(rewardRoleId));
    if (!rewardRole)
        return;
    const bot = guild.members.me;
    if (!bot)
        return cs.dev("Bot not found in guild while handling giveaway reward roles");
    if (!bot.permissions.has(PermissionFlagsBits.ManageRoles)) {
        cs.dev("Bot does not have the necessary permissions to manage roles while giving reward role");
    }
    if (rewardRole.managed) {
        cs.dev("handleAutoRoles: Cannot assign a managed role");
        return;
    }
    if (bot.roles.highest.position <= rewardRole.position) {
        cs.dev("handleAutoRoles: Bot's highest role must be higher than the role to be managed in order to assign it");
    }
    await member.roles.add(rewardRole);
}
