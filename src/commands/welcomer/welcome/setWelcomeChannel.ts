import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";
import { db } from "../../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction) {
    try {
        const guildId = interaction.guildId!;
        const channel = interaction.options.getChannel("channel", true);
        const channelId = channel.id;

        await interaction.deferReply({ ephemeral: true });

        await db.welcomer.setWelcomeChannel(guildId, channelId);

        await interaction.reply({
            content: `Welcome channel set to <#${channelId}>`,
            ephemeral: true,
        });
    } catch (error) {
        cs.error("Error while setting welcome channel: " + error);

        await Helpers.trySendCommandError(interaction)
    }
}