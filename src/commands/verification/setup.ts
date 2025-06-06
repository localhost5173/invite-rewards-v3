import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  TextChannel,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
} from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import colorString from "color-string";
import { db } from "../../utils/db/db.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "simple" | "question" | "pin"
) {
  const guildId = interaction.guildId!;
  const role = interaction.options.getRole("role");
  const channel = interaction.options.getChannel("channel");

  if (!role) {
    return interaction.reply({
      embeds: [await Embeds.createEmbed(guildId, "roles.noRoleProvided")],
      ephemeral: true,
    });
  }

  if (role.managed) {
    return interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "roles.managedRoleAssignError"),
      ],
      ephemeral: true,
    });
  }

  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      embeds: [await Embeds.createEmbed(guildId, "channels.noChannelProvided")],
      ephemeral: true,
    });
  }

  if (!(channel instanceof TextChannel)) {
    return interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "channels.invalidChannelType"),
      ],
      ephemeral: true,
    });
  }

  const bot = interaction.guild!.members.me;

  if (!bot) {
    return interaction.reply({
      embeds: [await Embeds.createEmbed(guildId, "general.botNotFound")],
      ephemeral: true,
    });
  }

  // Check if the bot's highest role is above the role it tries to manage
  if (bot.roles.highest.position <= role.position) {
    return interaction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "roles.roleHierarchyError", {
          role: `<@&${role.id}>`,
        }),
      ],
      ephemeral: true,
    });
  }

  try {
    const modal = new ModalBuilder()
      .setTitle("Verification Setup")
      .setCustomId("verification-setup-simple");

    const titleField = new TextInputBuilder()
      .setCustomId("verification-setup-simple-title")
      .setLabel("Title of the verification embed")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("E.g. Verification")
      .setRequired(false);

    const descriptionField = new TextInputBuilder()
      .setCustomId("verification-setup-simple-description")
      .setLabel("Description of the verification embed")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("E.g. Please verify that you are a human")
      .setRequired(false);

    const thumbnailField = new TextInputBuilder()
      .setCustomId("verification-setup-simple-thumbnail")
      .setLabel("Thumbnail of the verification embed")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("E.g. https://example.com/image.png")
      .setRequired(false);

    const colorField = new TextInputBuilder()
      .setCustomId("verification-setup-simple-color")
      .setLabel("Color of the verification embed")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("E.g. #FF0000")
      .setRequired(false);

    const buttonTitleField = new TextInputBuilder()
      .setCustomId("verification-setup-simple-button-title")
      .setLabel("Button title")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("E.g. Verify")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleField),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionField),
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailField),
      new ActionRowBuilder<TextInputBuilder>().addComponents(colorField),
      new ActionRowBuilder<TextInputBuilder>().addComponents(buttonTitleField)
    );

    await interaction.showModal(modal);

    const modalInteraction = await interaction.awaitModalSubmit({
      time: 60000,
      filter: (i) => i.customId === "verification-setup-simple",
    });

    const title = modalInteraction.fields.getTextInputValue(
      "verification-setup-simple-title"
    );
    const description = modalInteraction.fields.getTextInputValue(
      "verification-setup-simple-description"
    );
    const thumbnail = modalInteraction.fields.getTextInputValue(
      "verification-setup-simple-thumbnail"
    );
    let color = modalInteraction.fields.getTextInputValue(
      "verification-setup-simple-color"
    );
    const buttonTitle = modalInteraction.fields.getTextInputValue(
      "verification-setup-simple-button-title"
    );

    // Verify the color is a valid hex color
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      color = "#FFFFFF";
    }

    // Use colorString to parse the color input and ensure it resolves to a hex string
    const colorParsed = colorString.get(color);
    const colorResolvable =
      colorParsed && colorParsed.model === "rgb"
        ? (colorString.to.hex(colorParsed.value) as ColorResolvable) // Assert to ColorResolvable type
        : ("#FFFFFF" as ColorResolvable); // Default color if invalid, also asserted

    // Create the verification embed
    const embed = new EmbedBuilder();

    embed.setTitle(title ? title : "Verification");
    embed.setDescription(
      description ? description : "Please verify that you are a human."
    );
    embed.setThumbnail(thumbnail ? thumbnail : null);
    embed.setColor(colorResolvable);

    const button = new ButtonBuilder()
      .setCustomId(`verification-button`)
      .setLabel(buttonTitle ? buttonTitle : "Verify")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    // Check if the channel is a TextChannel before sending the embed
    await channel.send({ embeds: [embed], components: [row] });

    // Save the verification system to the database
    switch (type) {
      case "simple":
        await db.verification.enableSimple(guildId, role.id);
        break;
      case "question": {
        const question = interaction.options.getString("question");
        const answer = interaction.options.getString("answer");

        if (!question || !answer) {
          return interaction.reply({
            embeds: [
              await Embeds.createEmbed(
                guildId,
                "verification.setup.noQuestionAnswer"
              ),
            ],
            ephemeral: true,
          });
        }

        await db.verification.enableQuestion(
          guildId,
          role.id,
          question,
          answer
        );
        break;
      }
      case "pin":
        await db.verification.enablePin(guildId, role.id);
        break;
    }

    await modalInteraction.reply({
      embeds: [
        await Embeds.createEmbed(guildId, "verification.setup.success", {
          channel: `<#${channel.id}>`,
          role: `<@&${role.id}>`,
        }),
      ],
      ephemeral: true,
    });

    switch (type) {
      case "simple":
        db.usage.incrementUses(guildId, UsageCommands.VerificationSetupSimple);
        break;
      case "question":
        db.usage.incrementUses(guildId, UsageCommands.VerificationSetupQuestion);
        break;
      case "pin":
        db.usage.incrementUses(guildId, UsageCommands.VerificationSetupPin);
        break;
    }
  } catch (error) {
    cs.error(
      "Error occurred while setting up the verification system: " + error
    );

    await Helpers.trySendCommandError(interaction);
  }
}