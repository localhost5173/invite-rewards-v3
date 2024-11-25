import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { devMode } from "../index.js";
import { Embeds } from "../utils/embeds/embeds.js";
import botconfig from "../../config.json" assert { type: "json" };
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";

export const data: CommandData = {
  name: "vote",
  description: "Vote for the bot on top.gg!",
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const voteTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "vote.voteTranslation"
    );

    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel(voteTranslation)
      .setURL(botconfig.bot.vote);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    await interaction.reply({
      embeds: [
        await Embeds.createEmbed(interaction.guild?.id || null, "vote.success"),
      ],
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    cs.error("Error in vote command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: false,
  voteLocked: false,
};
