import {
  ActionRowBuilder,
  APIRole,
  Attachment,
  ChatInputCommandInteraction,
  InteractionCollector,
  ModalSubmitInteraction,
  Role,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { Helpers } from "../../utils/helpers/helpers";
import { db } from "../../utils/db/db";
import { Embeds } from "../../utils/embeds/embeds";

type RewardType = "role" | "message" | "messageStore";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;
    const rewardName = interaction.options.getString("name", true);
    const inviteThreshold = interaction.options.getInteger("threshold", true);
    const type = interaction.options.getString("type", true) as RewardType;
    const role = interaction.options.getRole("role", false);
    const storeFile = interaction.options.getAttachment("store", false);

    if (type !== "role" && role) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "rewards.add.roleNotRequired"),
        ],
        ephemeral: true,
      });
      return;
    }

    if (type !== "messageStore" && storeFile) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "rewards.add.storeNotRequired"),
        ],
        ephemeral: true,
      });
      return;
    }

    const doesRewardExist = await db.rewards.doesRewardExist(
      guildId,
      rewardName
    );
    const rewards = await db.rewards.getRewards(guildId);

    if (doesRewardExist) {
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(guildId, "rewards.add.alreadyExists"),
        ],
        ephemeral: true,
      });
      return;
    }

    if (rewards.length >= 10) {
      await interaction.reply({
        embeds: [await Embeds.createEmbed(guildId, "rewards.add.maxReached")],
        ephemeral: true,
      });
      return;
    }

    switch (type) {
      case "role": {
        await handleRoleReward(
          interaction,
          guildId,
          inviteThreshold,
          rewardName,
          role
        );
        break;
      }
      case "message":
        await handleMessageReward(
          interaction,
          guildId,
          inviteThreshold,
          rewardName
        );
        break;
      case "messageStore":
        await handleMessageStoreReward(
          interaction,
          guildId,
          inviteThreshold,
          rewardName,
          storeFile
        );
        break;
    }
  } catch (error) {
    cs.error(
      "An error occurred while executing the reward view command: " + error
    );

    await Helpers.trySendCommandError(interaction);
  }
}

async function handleRoleReward(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  inviteThreshold: number,
  rewardName: string,
  role: Role | APIRole | null
): Promise<void> {
  if (!role) {
    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "rewards.add.role.roleRequired"),
      ],
      ephemeral: true,
    });
    return;
  }

  const roleId = role.id;

  // Add role reward to database
  await db.rewards.addRoleReward(guildId, inviteThreshold, rewardName, roleId);
  await interaction.reply({
    embeds: [
      await Embeds.createEmbed(guildId, "rewards.add.role.success", {
        rewardName,
        role: `<@&${roleId}>`,
      }),
    ],
    ephemeral: true,
  });
}

async function handleMessageReward(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  inviteThreshold: number,
  rewardName: string
) {
  // Open modal to get message
  const modal = await Embeds.createModal(guildId, "modals.rewards.add.message");
  modal.setCustomId("rewardMessageModal");

  const modalMessageField = await Embeds.createTextField(
    guildId,
    "modals.rewards.add.message.messageField"
  );
  modalMessageField.setCustomId("messageField");
  modalMessageField.setRequired(true);
  modalMessageField.setStyle(TextInputStyle.Paragraph);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(modalMessageField)
  );

  // Send modal
  await interaction.showModal(modal);

  // Get message from modal
  const filter = (i: ModalSubmitInteraction) =>
    i.customId === "rewardMessageModal" && i.user.id === interaction.user.id;

  // Create a new collector
  const collector = new InteractionCollector<ModalSubmitInteraction>(
    interaction.client,
    { filter, time: 15_000 }
  );

  collector.on("collect", async (modalInteraction) => {
    const message = modalInteraction.fields.getTextInputValue("messageField");

    cs.log("Message: " + message);

    if (!message) {
      await modalInteraction.reply({
        embeds: [
          await Embeds.createEmbed(
            guildId,
            "rewards.add.message.messageRequired"
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    // Add message reward to database
    await db.rewards.addMessageReward(
      guildId,
      inviteThreshold,
      rewardName,
      message
    );

    await modalInteraction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "rewards.add.message.success", {
          rewardName,
          message,
        }),
      ],
      ephemeral: true,
    });
  });
}

async function handleMessageStoreReward(
  interaction: ChatInputCommandInteraction,
  guildId: string,
  inviteThreshold: number,
  rewardName: string,
  storeFile: Attachment | null
) {
  if (!storeFile) {
    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "rewards.add.messageStore.fileRequired"),
      ],
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // Fetch the file content from the attachment URL
  const response = await fetch(storeFile.url);
  const textContent = await response.text();

  // Split the content by newlines to get an array of links
  const links = textContent
    .split("\n")
    .map((link) => link.trim())
    .filter(Boolean);

  if (links.length === 0) {
    return interaction.followUp({
        embeds: [
            await Embeds.createEmbed(guildId, "rewards.add.messageStore.fileEmpty"),
        ],
        ephemeral: true,
    });
  }

  await db.rewards.addMessageStoreReward(
    guildId,
    inviteThreshold,
    rewardName,
    links
  );
  await interaction.followUp({
    embeds: [
      await Embeds.createEmbed(guildId, "rewards.add.messageStore.success", {
        rewardName,
      }),
    ],
    ephemeral: true,
  });
}
