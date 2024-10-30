import {
  ActionRowBuilder,
  APIInteractionGuildMember,
  ButtonInteraction,
  GuildMember,
  GuildMemberRoleManager,
  Interaction,
  InteractionCollector,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";
import checkRolePermissions from "../../utils/helpers/checkRolePermissions";
import { VerificationDocument } from "../../utils/db/models/verification";

const activeCollectors = new Map<
  string,
  InteractionCollector<ModalSubmitInteraction>
>();

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "verification-button") return;
  if (!interaction.guild) return;

  try {
    const verificationObject = await db.verification.getVerification(
      interaction.guild.id
    );

    if (!verificationObject || !verificationObject.enabled) {
      await interaction.reply({
        content: "Verification is disabled in this server.",
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as
      | GuildMember
      | APIInteractionGuildMember;
    if (!member) {
      return cs.dev("Member not found in guild while handling auto roles");
    }

    const { passed, message } = await checkRolePermissions(
      interaction,
      verificationObject.roleId,
      member
    );

    if (!passed) {
      await interaction.reply({
        content: message,
        ephemeral: true,
      });
      return;
    }

    switch (verificationObject.type) {
      case "simple":
        await handleSimpleVerification(
          interaction,
          verificationObject.roleId,
          member
        );
        break;
      case "question":
        await handleQuestionVerification(
          interaction,
          verificationObject,
          member
        );
        break;
      case "pin":
        await handlePinVerification(interaction, verificationObject, member);
        break;
      default:
        await interaction.reply({
          content: "Unknown verification type.",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error("Error in verification handler:", error);
    interaction.followUp({
      content: "An error occurred while verifying you.",
      ephemeral: true,
    });
  }
}

// Simple verification
async function handleSimpleVerification(
  interaction: ButtonInteraction,
  roleId: string,
  member: GuildMember | APIInteractionGuildMember
) {
  const { passed, role, message } = await checkRolePermissions(
    interaction,
    roleId,
    member
  );

  if (!passed) {
    await interaction.reply({
      content: message,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  if (member.roles instanceof GuildMemberRoleManager) {
    await member.roles.add(role!);
    await interaction.followUp({
      content: "You have been verified!",
      ephemeral: true,
    });
  } else {
    cs.dev("Member roles is not a GuildMemberRoleManager");
    await interaction.followUp({
      content: "An error occurred while verifying you.",
      ephemeral: true,
    });
  }
}

// Question-based verification
async function handleQuestionVerification(
  interaction: ButtonInteraction,
  verificationObject: VerificationDocument,
  member: GuildMember | APIInteractionGuildMember
) {
  const { question, roleId, answer: correctAnswer } = verificationObject;

  if (!roleId || !question || !correctAnswer) {
    await interaction.reply({
      content: "Invalid verification settings.",
      ephemeral: true,
    });
    return;
  }

  const modal = questionVerificationModal(question);
  await interaction.showModal(modal);

  const filter = (i: ModalSubmitInteraction) =>
    i.customId === "verification-modal" && i.user.id === interaction.user.id;

  const existingCollector = activeCollectors.get(interaction.user.id);
  if (existingCollector) {
    existingCollector.stop();
  }

  const collector = new InteractionCollector<ModalSubmitInteraction>(
    interaction.client,
    { filter, time: 15_000 }
  );
  activeCollectors.set(interaction.user.id, collector);

  collector.on("collect", async (modalInteraction) => {
    const userAnswer = modalInteraction.fields.getTextInputValue(
      "verification-question"
    );

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      await (member.roles as GuildMemberRoleManager).add(roleId);
      await modalInteraction.reply({
        content: "Verification successful!",
        ephemeral: true,
      });
    } else {
      await modalInteraction.reply({
        content: "Incorrect answer.",
        ephemeral: true,
      });
    }
  });

  collector.on("end", async (collected) => {
    activeCollectors.delete(interaction.user.id);
    if (collected.size === 0) {
      await interaction.followUp({
        content: "You took too long to respond.",
        ephemeral: true,
      });
    }
  });
}

/// PIN-based verification
async function handlePinVerification(
  interaction: ButtonInteraction,
  verificationObject: VerificationDocument,
  member: GuildMember | APIInteractionGuildMember
) {
  const pin = Math.floor(Math.random() * 9000) + 1000;
  const embed = new EmbedBuilder()
    .setTitle("Verification Required")
    .addFields(
      { name: "PIN", value: `\`${pin}\``, inline: true },
      { name: "Input", value: "` `", inline: true }
    )
    .setColor(0x00ff00);

  const rows = Array.from({ length: 10 }, (_, i) =>
    new ButtonBuilder()
      .setCustomId(`digit_${i}`)
      .setLabel(`${i}`)
      .setStyle(ButtonStyle.Secondary)
  );

  const actionRows = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(rows.slice(0, 5)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(rows.slice(5)),
  ];
  await interaction.reply({
    embeds: [embed],
    components: actionRows,
    ephemeral: true,
  });

  const filter = (i: Interaction) => i.user.id === interaction.user.id;

  const collector = (
    interaction.channel as TextChannel
  )?.createMessageComponentCollector({ filter, time: 15_000 });

  let userInput = "";

  collector?.on("collect", async (i) => {
    if (!i.isButton()) return;

    const digit = i.customId.split("_")[1];
    userInput += digit;

    const updatedEmbed = new EmbedBuilder(embed.toJSON()).setFields([
      { name: "PIN", value: `\`${pin}\``, inline: true },
      { name: "Input", value: `\`${userInput}\``, inline: true },
    ]);

    if (userInput.length >= 4) {
      if (userInput === `${pin}`) {
        await i.update({
          content: "Verification successful!",
          components: [],
          embeds: [updatedEmbed],
        });
        await (member.roles as GuildMemberRoleManager).add(
          verificationObject.roleId!
        );
      } else {
        await i.update({
          content: "Verification failed. Incorrect PIN.",
          components: [],
          embeds: [updatedEmbed],
        });
      }
      collector.stop();
    } else {
      await i.update({ embeds: [updatedEmbed] });
    }
  });

  collector?.on("end", async (collected, reason) => {
    activeCollectors.delete(interaction.user.id);

    // Check if the collector ended due to timeout
    if (reason === "time" && userInput.length < 4) {
      await interaction.followUp({
        content: "Verification timed out. Please try again.",
        ephemeral: true,
      });
    }
  });
}

// Helper for question-based modal
function questionVerificationModal(question: string) {
  const modal = new ModalBuilder()
    .setCustomId("verification-modal")
    .setTitle("Verification");

  const questionInput = new TextInputBuilder()
    .setCustomId("verification-question")
    .setLabel(question)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    questionInput
  );
  modal.addComponents(actionRow);

  return modal;
}
