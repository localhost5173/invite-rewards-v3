import type {
    CommandData,
    SlashCommandProps,
    CommandOptions,
} from "commandkit";
import {
    ApplicationCommandOptionType,
    TextChannel,
    EmbedBuilder,
    GuildChannel,
    ChannelType,
    ChatInputCommandInteraction,
} from "discord.js";
import { setInfoChannel } from "../../firebase/channels.js";
import { devMode } from "../../index.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };;

export default async function (interaction : ChatInputCommandInteraction) {
    try {
        const targetChannel = interaction.options.getChannel(
            "channel",
            true
        ) as GuildChannel;

        if (!targetChannel) {
            const embed = setInfoChannelErrorEmbed("Please provide a valid channel.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (targetChannel.type !== ChannelType.GuildText) {
            const embed = setInfoChannelErrorEmbed("Please provide a text channel.");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guildId;

        if (!guildId) {
            const embed = setInfoChannelErrorEmbed("This command can only be used in a guild.");
            return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        await setInfoChannel(guildId, targetChannel.id);

        const embed = setInfoChannelSuccessEmbed(`Info channel has been set to <#${targetChannel.id}>`);
        interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (error) {
        console.error("Error while running set-info-channel command", error);
        const embed = setInfoChannelErrorEmbed("Error while setting the info channel.");
        interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ["ManageChannels"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
};

// Function to create an embed for successful operation
function setInfoChannelSuccessEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("✅ Success ✅")
        .setColor(0x00ff00) // Green color to indicate success
        .setDescription(message)
        .setFooter({ text: "Info Channel Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}

// Function to create an embed for errors
function setInfoChannelErrorEmbed(errorMessage: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("❌ Error ❌")
        .setColor(0xff0000) // Red color to indicate error
        .setDescription(errorMessage)
        .setFooter({ text: "Info Channel Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}