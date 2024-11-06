import {
  ActionRowBuilder,
  APIInteractionGuildMember,
  ButtonInteraction,
  GuildMember,
  GuildMemberRoleManager,
  Interaction,
  InteractionCollector,
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
import { Embeds } from "../../utils/embeds/embeds";

// Map to store active collectors for question-based verification
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

    const isFakeUser = await db.invites.joinedUsers.isFakeUser(
      interaction.guild.id,
      interaction.user.id
    );

    if (isFakeUser) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            interaction.guild.id,
            "verification.event.all.fakeUser"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (!verificationObject || !verificationObject.enabled) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            interaction.guild.id,
            "verification.event.all.verificationDisabled"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as
      | GuildMember
      | APIInteractionGuildMember;
    if (!member) {
      await interaction.reply({
        content: "Member not found in guild while handling auto roles",
        ephemeral: true,
      });
      return cs.dev("Member not found in guild while handling auto roles");
    }

    const { passed, embed } = await checkRolePermissions(
      interaction,
      verificationObject.roleId,
      member
    );

    if (!passed) {
      await interaction.reply({
        embeds: [embed],
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
          embeds: [
            await Embeds.createEmbed(
              interaction.guild.id,
              "verification.event.all.unknownType"
            ),
          ],
          ephemeral: true,
        });
    }
  } catch (error) {
    cs.error("Error in verification handler: " + error);
    interaction.followUp({
      embeds: [
        await Embeds.createEmbed(
          interaction.guild!.id,
          "verification.event.all.error"
        ),
      ],
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
  // Check if the bot has the necessary permissions to add the role
  const { passed, role, embed } = await checkRolePermissions(
    interaction,
    roleId,
    member
  );

  const guildId = interaction.guild!.id;
  const userId = member.user.id;

  // If the bot doesn't have the necessary permissions, reply with the error message
  if (!passed) {
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  // Add the role to the user
  if (member.roles instanceof GuildMemberRoleManager) {
    await member.roles.add(role!);

    const inviter = await db.invites.joinedUsers.getInviterOfUser(
      guildId,
      userId
    );

    // If the inviter is found, swap the unverified invite for a real one
    if (inviter) {
      await db.invites.joinedUsers.setVerified(guildId, userId, true);
      await db.invites.userInvites.swapUnverifiedForReal(guildId, userId);
    } else {
      cs.dev("Inviter not found while verifying user");
    }

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "verification.event.all.success"),
      ],
      ephemeral: true,
    });
  } else {
    cs.dev("Member roles is not a GuildMemberRoleManager");
    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "verification.event.all.error"),
      ],
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

  const guildId = interaction.guild!.id;
  const userId = member.user.id;

  // Check if the verification settings are valid
  if (!roleId || !question || !correctAnswer) {
    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(
          guildId,
          "verification.event.question.invalidConfig"
        ),
      ],
      ephemeral: true,
    });
    return;
  }

  // Check if the bot has the necessary permissions to add the role
  const { passed, embed } = await checkRolePermissions(
    interaction,
    roleId,
    member
  );

  if (!passed) {
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
    return;
  }

  // Show the question in a modal
  const modal = await questionVerificationModal(question, guildId);
  await interaction.showModal(modal);

  // Create a collector to listen for user input
  const filter = (i: ModalSubmitInteraction) =>
    i.customId === "verification-modal" && i.user.id === interaction.user.id;

  // Stop any existing collectors for the user
  const existingCollector = activeCollectors.get(interaction.user.id);
  if (existingCollector) {
    existingCollector.stop();
  }

  // Create a new collector
  const collector = new InteractionCollector<ModalSubmitInteraction>(
    interaction.client,
    { filter, time: 15_000 }
  );

  // Add the collector to the active collectors map
  activeCollectors.set(interaction.user.id, collector);

  collector.on("collect", async (modalInteraction) => {
    const userAnswer = modalInteraction.fields.getTextInputValue(
      "verification-question"
    );

    // Check if the user's answer is correct
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      // Add the role to the user
      await (member.roles as GuildMemberRoleManager).add(roleId);

      // If the inviter is found, swap the unverified invite for a real one
      const inviter = await db.invites.joinedUsers.getInviterOfUser(
        guildId,
        userId
      );

      if (inviter) {
        await db.invites.joinedUsers.setVerified(guildId, userId, true);
        await db.invites.userInvites.swapUnverifiedForReal(guildId, userId);
      } else {
        cs.dev("Inviter not found while verifying user");
      }

      await modalInteraction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "verification.event.all.success"),
        ],
        ephemeral: true,
      });
    } else {
      await modalInteraction.reply({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "verification.event.question.incorrectAnswer"
          ),
        ],
        ephemeral: true,
      });
    }
  });

  collector.on("end", async () => {
    activeCollectors.delete(interaction.user.id);
  });
}

/// PIN-based verification
async function handlePinVerification(
  interaction: ButtonInteraction,
  verificationObject: VerificationDocument,
  member: GuildMember | APIInteractionGuildMember
) {
  const guildId = interaction.guild!.id;
  const userId = member.user.id;

  // Check if the bot has the necessary permissions to add the role
  const { passed, embed: errorEmbed } = await checkRolePermissions(
    interaction,
    verificationObject.roleId,
    member
  );

  if (!passed) {
    await interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true,
    });
    return;
  }

  // Generate a random 4-digit PIN and embed
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

  // Create a collector to listen for user input
  const filter = (i: Interaction) => i.user.id === interaction.user.id;
  const collector = (
    interaction.channel as TextChannel
  )?.createMessageComponentCollector({ filter, time: 15_000 });

  let userInput = "";

  // Handle user input
  collector?.on("collect", async (i) => {
    if (!i.isButton()) return;
    if (i.user !== interaction.user || !i.customId.includes("digit_")) return;

    // Append the digit to the user input
    const digit = i.customId.split("_")[1];
    userInput += digit;

    // Update the embed with the new user input
    const updatedEmbed = new EmbedBuilder(embed.toJSON()).setFields([
      { name: "PIN", value: `\`${pin}\``, inline: true },
      { name: "Input", value: `\`${userInput}\``, inline: true },
    ]);

    // If the user input is 4 digits long, check if it matches the PIN
    if (userInput.length >= 4) {
      // If the PIN is correct, add the role to the userf
      if (userInput === `${pin}`) {
        // Get the inviter of the user and swap the unverified invite for a real one
        const inviterId = await db.invites.joinedUsers.getInviterOfUser(
          guildId,
          userId
        );

        cs.dev("Inviter: " + inviterId);
        if (inviterId) {
          await db.invites.joinedUsers.setVerified(guildId, userId, true);
          await db.invites.userInvites.swapUnverifiedForReal(
            guildId,
            inviterId
          );
        } else {
          cs.dev("Inviter not found while verifying user");
        }

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
        embeds: [
          await Embeds.createEmbed(guildId, "verification.event.all.timeout"),
        ],
        ephemeral: true,
      });
    }
  });
}

// Helper for question-based modal
async function questionVerificationModal(question: string, guildId: string) {
  const modal = await Embeds.createModal(guildId, "modals.verification.question");
  modal.setCustomId("verification-modal");

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