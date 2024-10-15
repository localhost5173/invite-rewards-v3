import {
  Interaction,
  ModalSubmitInteraction,
  InteractionCollector,
  InteractionResponseType,
} from "discord.js";
import { getVerificationQuestion } from "../../firebase/verification.js";
import {
  errorEmbed,
  questionVerificationModal,
  successEmbed,
} from "../../utils/embeds/verification.js";
import { giveRole } from "../../utils/verification/giveRole.js";

// Create a map to store collectors per user ID
const activeCollectors = new Map<
  string,
  InteractionCollector<ModalSubmitInteraction>
>();

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "question-verification") return;
  if (!interaction.guildId) return;
  if (!interaction.channel) return;

  try {
    const guildId = interaction.guildId;
    const questionVerificationObject = await getVerificationQuestion(
      interaction.guildId
    );
    const {
      question,
      answer: correctAnswer,
      role: roleId,
    } = questionVerificationObject;

    if (!questionVerificationObject) return;

    // Check if the user already has the role
    const member = interaction.member;
    if (member && "cache" in member.roles && member.roles.cache.has(roleId)) {
      return interaction.reply({
        content: "You are already verified.",
        ephemeral: true,
      });
    }

    if (!roleId || !question || !correctAnswer) return;

    const modal = questionVerificationModal(question);
    await interaction.showModal(modal);

    const filter = (i: ModalSubmitInteraction) =>
      i.customId === "verification-modal" && i.user.id === interaction.user.id;

    // Check if there's an existing collector for this user and stop it
    const existingCollector = activeCollectors.get(interaction.user.id);
    if (existingCollector) {
      existingCollector.stop(); // Stop any existing collector for the user
    }

    const collector = new InteractionCollector<ModalSubmitInteraction>(
      interaction.client,
      {
        filter,
        time: 15_000, // 15 seconds timeout
      }
    );

    // Store the new collector in the map
    activeCollectors.set(interaction.user.id, collector);

    collector.on(
      "collect",
      async (modalInteraction: ModalSubmitInteraction) => {
        const userAnswer = modalInteraction.fields.getTextInputValue(
          "verification-question"
        );

        try {
          if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            await giveRole(interaction, roleId); // Assign the role
            await modalInteraction.reply({
              embeds: [successEmbed()],
              ephemeral: true,
            }); // Confirm verification
          } else {
            await modalInteraction.reply({
              embeds: [errorEmbed("Incorrect answer.")],
              ephemeral: true, // Respond only to the user
            });
          }
        } catch (error) {
          console.error("Error handling interaction:", error);
        }
      }
    );

    collector.on("end", async (collected) => {
      // Remove the collector from the map when it's done
      activeCollectors.delete(interaction.user.id);

      if (collected.size === 0) {
        try {
          await interaction.followUp({
            embeds: [errorEmbed("You took too long to respond.")],
            ephemeral: true,
          });
        } catch (error) {
          console.error("Error sending follow-up message:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error during verification:", error);
    try {
      await interaction.followUp({
        embeds: [errorEmbed()],
        ephemeral: true,
      });
    } catch (err) {
      console.error("Error sending follow-up message:", err);
    }
  }
}
