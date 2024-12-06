import { ChannelType } from "discord.js";
import { db } from "../../../utils/db/db.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
export default async function (interaction, type) {
    try {
        const guildId = interaction.guildId;
        const channel = interaction.options.getChannel("channel", true);
        const channelId = channel.id;
        await interaction.deferReply({ ephemeral: true });
        if (channel.type !== ChannelType.GuildText) {
            await interaction.followUp({
                embeds: [
                    await Embeds.createEmbed(guildId, "general.textChannelOnly"),
                ],
                ephemeral: true,
            });
            return;
        }
        if (type === "welcome") {
            await db.welcomer.setWelcomeChannel(guildId, channelId);
        }
        else {
            await db.welcomer.setFarewellChannel(guildId, channelId);
        }
        const welcomeTranslation = await Embeds.getStringTranslation(guildId, "welcomer.translations.welcome");
        const farewellTranslation = await Embeds.getStringTranslation(guildId, "welcomer.translations.farewell");
        await interaction.followUp({
            embeds: [
                await Embeds.createEmbed(guildId, `welcomer.setChannel`, {
                    channel: `<#${channelId}>`,
                    channelType: type === "welcome" ? welcomeTranslation : farewellTranslation
                })
            ],
            ephemeral: true,
        });
    }
    catch (error) {
        cs.error(`Error while setting ${type} channel: ` + error);
        await Helpers.trySendCommandError(interaction);
    }
}
