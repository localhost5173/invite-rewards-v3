import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  EmbedField,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { cs } from "../../../utils/console/customConsole.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
import { db } from "../../../utils/db/db.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {
  const guildId = interaction.guildId!;

  try {
    const modal = await Embeds.createModal(guildId, "modals.welcomer.setEmbed");
    modal.setCustomId("setEmbed");

    const jsonField = await Embeds.createTextField(
      guildId,
      "modals.welcomer.setEmbed.jsonField"
    );
    jsonField.setCustomId("setEmbedJsonField");
    jsonField.setRequired(true);
    jsonField.setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(jsonField)
    );

    await interaction.showModal(modal);

    // Collect the response
    const modalInteraction = await interaction.awaitModalSubmit({
      time: 180_000,
      filter: (i) =>
        i.customId === "setEmbed" && i.user.id === interaction.user.id,
    });

    // Acknowledge the modal submission
    await modalInteraction.deferReply({ ephemeral: true });

    const embedJson =
      modalInteraction.fields.getTextInputValue("setEmbedJsonField");

    // Check if the JSON is valid
    let embedData;
    try {
      embedData = JSON.parse(embedJson);
    } catch {
      const errorEmbed = await Embeds.createEmbed(
        guildId,
        "general.invalidJson"
      );
      return modalInteraction.followUp({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    // Check embed length limits
    const totalLength =
      (embedData.title?.length || 0) +
      (embedData.description?.length || 0) +
      (embedData.footer?.text?.length || 0) +
      (embedData.author?.name?.length || 0) +
      (embedData.fields?.reduce(
        (acc: number, field: EmbedField) =>
          acc + (field.name?.length || 0) + (field.value?.length || 0),
        0
      ) || 0);

    if (
      embedData.title?.length > 256 ||
      embedData.description?.length > 4096 ||
      embedData.footer?.text?.length > 2048 ||
      embedData.author?.name?.length > 256 ||
      (embedData.fields?.length || 0) > 25 ||
      embedData.fields?.some(
        (field: EmbedField) =>
          field.name?.length > 256 || field.value?.length > 1024
      ) ||
      totalLength > 6000
    ) {
      const errorEmbed = await Embeds.createEmbed(
        guildId,
        "general.embedTooLong"
      );
      return modalInteraction.followUp({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder(embedData);

    if (type === "welcome") {
      await db.welcomer.setWelcomeEmbed(guildId, embed, location);
    } else {
      await db.welcomer.setFarewellEmbed(guildId, embed, location);
    }

    await modalInteraction.followUp({
      embeds: [await Embeds.createEmbed(guildId, "welcomer.setEmbed.success")],
      ephemeral: true,
    });
  } catch (error) {
    cs.error(`Error while setting ${type} embed: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
