import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };;

export function simpleVerificationEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("Verification Required")
    .setDescription("Please verify yourself to gain access to the server.")
    .setColor(0x00ff00) // Green color
    .setFooter({
      text: "Verification System",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function simpleVerificationButton() {
  const button = new ButtonBuilder()
    .setCustomId("simple-verification")
    .setLabel("Verify")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅"); // Optional: Add an emoji

  return button;
}

export function questionVerificationEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("Verification Required")
    .setDescription(
      "Please click the button to start the verification process."
    )
    .setColor(0x00ff00) // Green color
    .setFooter({
      text: "Verification System",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function questionVerificationButton() {
  const button = new ButtonBuilder()
    .setCustomId("question-verification")
    .setLabel("Verify")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅"); // Optional: Add an emoji

  return button;
}

export function questionVerificationModal(question: string) {
  const modal = new ModalBuilder()
    .setCustomId("verification-modal")
    .setTitle("Verification");

  // Create the text input components
  const questionInput = new TextInputBuilder()
    .setCustomId("verification-question")
    .setLabel(question)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // Add the text input components to an action row
  const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    questionInput
  );

  // Add the action row to the modal
  modal.addComponents(actionRow);

  return modal;
}

export function pinVerificationEmbed() {
  const embed = new EmbedBuilder()
    .setTitle("Verification Required")
    .setDescription("Please click the button to start the verification process.")
    .setColor(0x00ff00) // Green color
    .setFooter({
      text: "Verification System",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function pinVerificationButton() {
  const button = new ButtonBuilder()
    .setCustomId("pin-verification")
    .setLabel("Verify")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅"); // Optional: Add an emoji

  return button;
}

export function errorEmbed(message?: string) {
  const embed = new EmbedBuilder()
    .setTitle("Error")
    .setDescription(message ? message : "An error occurred while processing your request.")
    .setColor(0xff0000) // Red color
    .setFooter({
      text: "Verification System",
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
      text: "Verification System",
      iconURL: botconfig.logo,
    }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}