import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {
  const guildId = interaction.guildId!;

  const modal = new ModalBuilder()
    .setTitle("Set Embed")
    .setCustomId("setEmbed");

  const jsonField = new TextInputBuilder()
    .setCustomId("setEmbedJson")
    .setLabel("JSON of the embed")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setPlaceholder(
      '```json\n{\n  "title": "Welcome to the server!",\n  "description": "We hope you enjoy your stay!"```'
    );

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(jsonField)
  );

  await interaction.showModal(modal);

  try {
    await interaction.deferReply({ ephemeral: true });
  } catch (error) {
    cs.error(`Error while setting ${type} embed: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
