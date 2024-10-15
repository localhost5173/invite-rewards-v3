import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import axios from "axios";
import { devMode } from "../index.js";

export const data: CommandData = {
  name: "feedback",
  description: "Give feedback on the bot or suggest new features!",
};

export async function run({ interaction, client }: SlashCommandProps) {
  // Open a modal for the user to send feedback
  try {
    const modal = new ModalBuilder()
      .setTitle("Feedback Form")
      .setCustomId("feedback");

    // Field 1: Feedback Type (Bug Report, Suggestion, etc.)
    const feedbackType = new TextInputBuilder()
      .setCustomId("feedbackType")
      .setLabel("Feedback Type (Bug Report, Suggestion, etc.)")
      .setStyle(TextInputStyle.Short) // Single-line input
      .setPlaceholder("E.g., Bug Report")
      .setRequired(true);

    // Field 2: Feedback details
    const feedbackInput = new TextInputBuilder()
      .setCustomId("feedbackInput")
      .setLabel("Please describe your feedback")
      .setStyle(TextInputStyle.Paragraph) // Multi-line input
      .setPlaceholder("Describe the issue or suggestion")
      .setRequired(true);

    // Field 3: Satisfaction level (1-5)
    const satisfaction = new TextInputBuilder()
      .setCustomId("satisfaction")
      .setLabel("How satisfied are you with the bot? (1-5)")
      .setStyle(TextInputStyle.Short) // Single-line input
      .setPlaceholder("Rate from 1 to 5")
      .setRequired(false); // Optional, in case they don't want to rate

    // Add the TextInput to ActionRows
    const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      feedbackType
    );
    const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      feedbackInput
    );
    const actionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      satisfaction
    );

    // Add the ActionRows to the modal
    modal.addComponents(actionRow1, actionRow2, actionRow3);

    // Show the modal
    await interaction.showModal(modal);

    // Handle modal submission
    const filter = (i: any) =>
      i.customId === "feedback" && i.user.id === interaction.user.id;

    // Collector to get the feedback from the modal
    interaction
      .awaitModalSubmit({ filter, time: 300000 }) // Collect feedback within 5 minutes
      .then(async (modalInteraction) => {
        const feedbackTypeValue =
          modalInteraction.fields.getTextInputValue("feedbackType");
        const feedback =
          modalInteraction.fields.getTextInputValue("feedbackInput");
        const satisfactionValue =
          modalInteraction.fields.getTextInputValue("satisfaction") ||
          "No rating given";
        const serverName = modalInteraction.guild?.name || "DM";
        const serverMemberCount = modalInteraction.guild?.memberCount || "DM";

        // Acknowledge the feedback
        await modalInteraction.reply({
          content: "Thanks for your feedback!",
          ephemeral: true,
        });

        // Send the feedback to a Discord webhook
        const webhookUrl =
          "https://discord.com/api/webhooks/1292878246878249044/ufHhU2CMlyaWvgxZjHpkMiGu9T1NKXyVfX-f-55I4IrJrEi_hOYccne1fM2UzrDiAhbX";
        await axios.post(webhookUrl, {
          content: `**New feedback received**\n
        **User:** ${modalInteraction.user.tag}\n
        **Server:** ${serverName} (${serverMemberCount} members)\n
        **Feedback Type:** ${feedbackTypeValue}\n
        **Feedback:**\n${feedback}\n
        **Satisfaction Level:** ${satisfactionValue}`,
        });
      })
      .catch(() => {
        // Handle the case where the user didn't submit in time
        interaction.followUp({
          content: "You took too long to submit feedback.",
          ephemeral: true,
        });
      });
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: "An error occurred while executing the command.",
      ephemeral: true,
    });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};
