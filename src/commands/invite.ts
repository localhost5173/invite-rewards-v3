import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { devMode } from "../bot.js";
import { Embeds } from "../utils/embeds/embeds.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import botconfig from "../../config.json" assert { type: "json" };
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";
import { db } from "../utils/db/db.js";
import { UsageCommands } from "../utils/db/models/usageModel.js";

export const data: CommandData = {
  name: "invite",
  description: "Invite the bot to your server!",
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const embed = await Embeds.createEmbed(
      interaction.guild?.id || null,
      "inviteBot.success"
    );
    const inviteBotTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "inviteBot.inviteBotTranslation"
    );
    const supportServerTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "inviteBot.supportServerTranslation"
    );
    const visitWebsiteTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "inviteBot.visitWebsiteTranslation"
    );
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(inviteBotTranslation)
        .setStyle(ButtonStyle.Link)
        .setURL(botconfig.bot.inviteLink),
      new ButtonBuilder()
        .setLabel(supportServerTranslation)
        .setStyle(ButtonStyle.Link)
        .setURL(botconfig.bot.server),
      new ButtonBuilder()
        .setLabel(visitWebsiteTranslation)
        .setStyle(ButtonStyle.Link)
        .setURL(botconfig.bot.website)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    db.usage.incrementUses(interaction.guildId ?? "", UsageCommands.BotInvite);
  } catch (error) {
    cs.error("Error in invite command: " + error);

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
