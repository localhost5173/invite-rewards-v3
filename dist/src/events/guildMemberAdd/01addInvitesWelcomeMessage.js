import { EmbedBuilder } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Leaderboards } from "../../utils/leaderboards/Leaderboards.js";
import { Rewards } from "../../utils/rewards/Rewards.js";
export default async function (guildMember) {
    try {
        if (guildMember.user.bot)
            return;
        const { guild } = guildMember;
        const currentInvites = await guild.invites.fetch();
        const dbInvites = await db.invites.inviteEntries.getEntriesForGuild(guild.id);
        const isVerificationEnabled = await db.verification.isEnabled(guild.id);
        let usedInvite;
        const vanityCode = guildMember.guild.vanityURLCode; // Check for vanity code
        // Compare current invites to the stored invites
        for (const invite of currentInvites.values()) {
            const dbInvite = dbInvites.find((entry) => entry.code === invite.code);
            if (dbInvite) {
                const oldInviteUses = dbInvite.uses ?? 0;
                if (invite.uses !== null && invite.uses > oldInviteUses) {
                    usedInvite = invite; // Found the used invite
                    break;
                }
            }
        }
        if (vanityCode && usedInvite && usedInvite.code === vanityCode) {
            cs.dev("User joined using a vanity link!");
            await sendWelcomeMessage(guildMember, null, true);
            return;
        }
        if (usedInvite) {
            const inviter = usedInvite.inviter;
            await db.invites.usedInvites.addEntry(guild.id, inviter?.id, usedInvite?.code, guildMember.id);
            if (inviter) {
                // Trycatch because inviterMember throws an error if the inviter is not in the guild
                try {
                    const inviterMember = await guild.members.fetch(inviter.id);
                    cs.dev("Inviter found: " + inviterMember.user.tag);
                    await sendWelcomeMessage(guildMember, inviterMember, false);
                    // Set verified to false if verification is enabled
                    if (isVerificationEnabled) {
                        await db.invites.joinedUsers.addEntry(guild.id, inviter.id, guildMember.id, false, !isRealUser(guildMember));
                    }
                    else {
                        await db.invites.joinedUsers.addEntry(guild.id, inviter.id, guildMember.id, true, !isRealUser(guildMember));
                    }
                    if (isRealUser(guildMember)) {
                        if (isVerificationEnabled) {
                            await db.invites.userInvites.addUnverified(guild.id, inviter.id);
                        }
                        else {
                            await db.invites.userInvites.addReal(guild.id, inviter.id);
                            await Leaderboards.updateLeaderboards(guild.id, inviter.id);
                            await Rewards.handleGiveRewards(guild.id, inviter.id);
                        }
                    }
                    else {
                        // Need to add a case for verification
                        await db.invites.userInvites.addFake(guild.id, inviter.id);
                    }
                    await db.invites.inviteEntries.addUse(guild.id, usedInvite.code);
                }
                catch {
                    cs.dev("Inviter member not found.");
                }
            }
            else {
                cs.dev("Inviter id not found.");
                await sendWelcomeMessage(guildMember, null, false);
            }
        }
    }
    catch (error) {
        cs.error("errror in handleAddInvites.ts: " + error);
    }
}
function isRealUser(guildMember) {
    const threshold = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const accountAge = Date.now() - guildMember.user.createdTimestamp;
    return accountAge >= threshold;
}
async function sendWelcomeMessage(guildMember, inviter, vanity) {
    const guildId = guildMember.guild.id;
    try {
        // Fetch welcomer settings from the database
        const welcomerSettings = await db.welcomer.getWelcomerSettings(guildId);
        if (!welcomerSettings)
            return;
        const { server, dm } = welcomerSettings;
        const { welcomeChannelId, welcomeMessage: serverWelcomeMessage, welcomeVanityMessage, welcomeEmbed: serverWelcomeEmbed, } = server;
        const { welcomeMessage: dmWelcomeMessage, welcomeEmbed: dmWelcomeEmbed } = dm;
        // Fetch inviter's invites
        const inviterInvites = inviter
            ? await db.invites.userInvites.getInvites(guildId, inviter.id)
            : null;
        // Send welcome message to the server channel if it exists
        if (welcomeChannelId) {
            const welcomeChannel = guildMember.guild.channels.cache.get(welcomeChannelId);
            if (welcomeChannel && welcomeChannel.isTextBased()) {
                let welcomeMessage = serverWelcomeMessage;
                const welcomeEmbed = serverWelcomeEmbed;
                // Use vanity welcome message if vanity is true and the message exists
                if (vanity && welcomeVanityMessage) {
                    welcomeMessage = welcomeVanityMessage;
                }
                if (welcomeEmbed) {
                    const finalWelcomeEmbed = replaceEmbedPlaceholders(welcomeEmbed, guildMember, inviter, inviterInvites);
                    await sendServerWelcomeEmbed(welcomeChannel, finalWelcomeEmbed);
                }
                else if (welcomeMessage) {
                    const finalWelcomeMessage = replacePlaceholders(welcomeMessage, guildMember, inviter, inviterInvites);
                    await sendServerWelcomeMessage(welcomeChannel, finalWelcomeMessage);
                }
            }
            else {
                cs.error(`Welcome channel not found or not text-based for guild: ${guildId}`);
            }
        }
        // Send welcome message to the user's DM if it exists
        if (dmWelcomeEmbed) {
            const finalDmWelcomeEmbed = replaceEmbedPlaceholders(dmWelcomeEmbed, guildMember, inviter, inviterInvites);
            await sendDmWelcomeEmbed(guildMember, finalDmWelcomeEmbed);
        }
        else if (dmWelcomeMessage) {
            const finalDmWelcomeMessage = replacePlaceholders(dmWelcomeMessage, guildMember, inviter, inviterInvites);
            await sendDmWelcomeMessage(guildMember, finalDmWelcomeMessage);
        }
    }
    catch (error) {
        cs.error(`Error while sending welcome message: ${error}`);
    }
}
/**
 * Replaces placeholders in the welcome message with actual values.
 */
function replacePlaceholders(message, guildMember, inviter, inviterInvites) {
    const inviterCount = (inviterInvites?.real ?? 0) + (inviterInvites?.bonus ?? 0);
    return message
        .replace("{mention-user}", `<@${guildMember.id}>`)
        .replace("{username}", guildMember.user.username)
        .replace("{user-tag}", guildMember.user.tag)
        .replace("{server-name}", guildMember.guild.name)
        .replace("{member-count}", guildMember.guild.memberCount.toString())
        .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
        .replace("{inviter-count}", inviterCount.toString() || "0")
        .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
        .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0");
}
/**
 * Replaces placeholders in the embed with actual values.
 */
function replaceEmbedPlaceholders(embed, guildMember, inviter, inviterInvites) {
    const inviterCount = (inviterInvites?.real ?? 0) + (inviterInvites?.bonus ?? 0);
    const embedBuilder = new EmbedBuilder(embed);
    if (embed.title) {
        embedBuilder.setTitle(embed.title
            .replace("{mention-user}", `<@${guildMember.id}>`)
            .replace("{username}", guildMember.user.username)
            .replace("{user-tag}", guildMember.user.tag)
            .replace("{server-name}", guildMember.guild.name)
            .replace("{member-count}", guildMember.guild.memberCount.toString())
            .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
            .replace("{inviter-count}", inviterCount.toString() || "0")
            .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
            .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0"));
    }
    if (embed.description) {
        embedBuilder.setDescription(embed.description
            .replace("{mention-user}", `<@${guildMember.id}>`)
            .replace("{username}", guildMember.user.username)
            .replace("{user-tag}", guildMember.user.tag)
            .replace("{server-name}", guildMember.guild.name)
            .replace("{member-count}", guildMember.guild.memberCount.toString())
            .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
            .replace("{inviter-count}", inviterCount.toString() || "0")
            .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
            .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0"));
    }
    if (embed.fields) {
        embedBuilder.setFields(embed.fields.map((field) => ({
            name: field.name
                .replace("{mention-user}", `<@${guildMember.id}>`)
                .replace("{username}", guildMember.user.username)
                .replace("{user-tag}", guildMember.user.tag)
                .replace("{server-name}", guildMember.guild.name)
                .replace("{member-count}", guildMember.guild.memberCount.toString())
                .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
                .replace("{inviter-count}", inviterCount.toString() || "0")
                .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
                .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0"),
            value: field.value
                .replace("{mention-user}", `<@${guildMember.id}>`)
                .replace("{username}", guildMember.user.username)
                .replace("{user-tag}", guildMember.user.tag)
                .replace("{server-name}", guildMember.guild.name)
                .replace("{member-count}", guildMember.guild.memberCount.toString())
                .replace("{inviter-tag}", inviter?.user.tag || "Unknown")
                .replace("{inviter-count}", inviterCount.toString() || "0")
                .replace("{inviter-real-count}", inviterInvites?.real.toString() || "0")
                .replace("{inviter-bonus-count}", inviterInvites?.bonus.toString() || "0"),
            inline: field.inline,
        })));
    }
    return embedBuilder;
}
/**
 * Sends a welcome message to the user's DM.
 */
async function sendDmWelcomeMessage(guildMember, dmWelcomeMessage) {
    try {
        await guildMember.send(dmWelcomeMessage);
    }
    catch (error) {
        cs.error(`Error while sending DM welcome message: ${error}`);
    }
}
/**
 * Sends a welcome embed to the user's DM.
 */
async function sendDmWelcomeEmbed(guildMember, dmWelcomeEmbed) {
    try {
        await guildMember.send({ embeds: [dmWelcomeEmbed] });
    }
    catch (error) {
        cs.error(`Error while sending DM welcome embed: ${error}`);
    }
}
/**
 * Sends a welcome message to the server channel.
 */
async function sendServerWelcomeMessage(welcomeChannel, serverWelcomeMessage) {
    try {
        await welcomeChannel.send(serverWelcomeMessage);
    }
    catch (error) {
        cs.error(`Error while sending server welcome message: ${error}`);
    }
}
/**
 * Sends a welcome embed to the server channel.
 */
async function sendServerWelcomeEmbed(welcomeChannel, serverWelcomeEmbed) {
    try {
        await welcomeChannel.send({ embeds: [serverWelcomeEmbed] });
    }
    catch (error) {
        cs.error(`Error while sending server welcome embed: ${error}`);
    }
}
