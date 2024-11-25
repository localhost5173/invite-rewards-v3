import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import {
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import axios from "axios";
import { devMode } from "../index.js";
import { Embeds } from "../utils/embeds/embeds.js";
import { Helpers } from "../utils/helpers/helpers.js";

export const data: CommandData = {
  name: "feedback",
  description: "Give feedback on the bot or suggest new features!",
};

export async function run({ interaction }: SlashCommandProps) {
  // Open a modal for the user to send feedback
  try {
    const modal = await Embeds.createModal(interaction.guild?.id || null, "modals.feedback");
    modal.setCustomId("feedback");

    const feedbackType = await Embeds.createTextField(interaction.guild?.id || "", "modals.feedback.feedbackTypeField");
    feedbackType.setCustomId("feedbackType");
    feedbackType.setRequired(true);
    feedbackType.setStyle(TextInputStyle.Short);

    const feedbackInput = await Embeds.createTextField(interaction.guild?.id || "", "modals.feedback.feedbackField");
    feedbackInput.setCustomId("feedbackInput");
    feedbackInput.setRequired(true);
    feedbackInput.setStyle(TextInputStyle.Paragraph);

    const satisfactionInput = await Embeds.createTextField(interaction.guild?.id || "", "modals.feedback.satisfactionField");
    satisfactionInput.setCustomId("satisfaction");
    satisfactionInput.setRequired(false);
    satisfactionInput.setStyle(TextInputStyle.Short);

    // Add the TextInput to ActionRows
    const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      feedbackType
    );
    const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      feedbackInput
    );
    const actionRow3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
      satisfactionInput
    );

    // Add the ActionRows to the modal
    modal.addComponents(actionRow1, actionRow2, actionRow3);

    // Show the modal
    await interaction.showModal(modal);

    // Handle modal submission
    const filter = (i: ModalSubmitInteraction) =>
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
          embeds: [
            await Embeds.createEmbed(interaction.guild?.id || null, "feedback")
          ],
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
      .catch(async () => {
        // Handle the case where the user didn't submit in time
        await interaction.followUp({
          embeds: [
            await Embeds.createEmbed(interaction.guild?.id || null, "general.interactionTimedOut")
          ],
          ephemeral: true,
        });
      });
  } catch (error) {
    console.error(error);
    
    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: false,
  voteLocked: false,
};
