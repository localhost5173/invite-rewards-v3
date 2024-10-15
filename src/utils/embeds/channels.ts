import { EmbedBuilder } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };

// Function to create an embed for successful operation
export function welcomeLeaveChannelSuccessEmbed(message: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("✅ Success ✅")
        .setColor(0x00ff00) // Green color to indicate success
        .setDescription(message)
        .setFooter({ text: "Leave Channel Management", iconURL: "https://example.com/path/to/your/footer-icon.png" }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}

// Function to create an embed for errors
export function welcomeLeaveChannelErrorEmbed(errorMessage: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("❌ Error ❌")
        .setColor(0xff0000) // Red color to indicate error
        .setDescription(errorMessage)
        .setFooter({ text: "Leave Channel Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
        .setTimestamp();

    return embed;
}