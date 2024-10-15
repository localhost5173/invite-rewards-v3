import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import botconfig from "../../botconfig.json" assert { type: "json" };
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { voteForBotEmbed } from "../utils/embeds/system.js";
import { devMode } from "../index.js";

export const data: CommandData = {
  name: "vote",
  description: "Vote for the bot on top.gg!",
};

export async function run({ interaction }: SlashCommandProps) {
    const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Vote")
        .setURL(botconfig.vote);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    await interaction.reply({
        embeds: [voteForBotEmbed()],
        components: [row],
        ephemeral: true,
    });
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};