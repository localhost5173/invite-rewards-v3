import { EmbedBuilder } from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };

export function errorEmbed(message?: string) {
    const embed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(message ? message : "An error occurred while processing your request.")
      .setColor(0xff0000) // Red color
      .setFooter({
        text: "Auto Role System",
        iconURL: botconfig.logo,
      }) // Replace with your footer icon URL
      .setTimestamp();
  
    return embed;
  }
  
  export function successEmbed(message?: string) {
    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(message ? message : "Verification successful.")
      .setColor(0x00ff00) // Green color
      .setFooter({
        text: "Auto Role System",
        iconURL: botconfig.logo,
      }) // Replace with your footer icon URL
      .setTimestamp();
  
    return embed;
  }