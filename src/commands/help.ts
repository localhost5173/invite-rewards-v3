import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  PartialGroupDMChannel,
} from "discord.js";
import { Embeds } from "../utils/embeds/embeds.js"
import botconfig from "../../config.json" with { type: "json" };
import { devMode } from "../index.js";
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";
import { db } from "../utils/db/db.js";
import { UsageCommands } from "../utils/db/models/usageModel.js";

interface Command {
  name: string;
  description: string;
}

interface Categories {
  [key: string]: Command[];
}

interface Field {
  name: string;
  value: string;
  inline: boolean;
}

export const data: CommandData = {
  name: "help",
  description: "Displays a list of all available commands.",
};

export async function run({ interaction }: SlashCommandProps) {
  try {

    const categories: Categories = await Embeds.getJson(
       interaction.guild?.id || null,
      "help.commands"
    );

    if (interaction.channel instanceof PartialGroupDMChannel) {
      return interaction.reply({
        embeds: [
          await Embeds.createEmbed(interaction.guild?.id || null, "general.noGroupDm"),
        ],
        ephemeral: true,
      });
    }

    db.usage.incrementUses(interaction.guildId ?? "", UsageCommands.HelpCommand);

    const categoryNames = Object.keys(categories);
    const totalPages = categoryNames.length;

    let currentPage = 0;
    let currentCategoryPage = 0;

    const generateEmbed = async (page: number, categoryPage: number) => {
      const category = categoryNames[page];
      const commands = categories[category];
      const commandsPerPage = 10;
      const totalCategoryPages = Math.ceil(commands.length / commandsPerPage);

      const translationsJson = await Embeds.getJson(
        interaction.guild?.id || null,
        "help.translations"
      );
      const embed = await Embeds.createEmbed(
        interaction.guild?.id || null,
        "help.embed",
        {
          category: translationsJson[category],
          page: (page + 1).toString(),
          totalPages: totalPages.toString(),
          categoryPage: (categoryPage + 1).toString(),
          totalCategoryPages: totalCategoryPages.toString(),
        }
      );

      const start = categoryPage * commandsPerPage;
      const end = start + commandsPerPage;
      const commandsToShow = commands.slice(start, end);

      commandsToShow.forEach((command) => {
        embed.addFields({
          name: `${command.name}`,
          value: command.description,
        });
      });

      const fields = await Embeds.getJson(
        interaction.guild?.id || null,
        "help.additionalFields"
      );
      fields.forEach((field: Field) => {
        embed.addFields({
          name: field.name,
          value: field.value
            .replace("{botInviteLink}", botconfig.bot.inviteLink)
            .replace("{supportServerLink}", botconfig.bot.server)
            .replace("{botGuideLink}", botconfig.bot.guide),
          inline: field.inline,
        });
      });

      return embed;
    };

    const previousTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "help.translations.previous"
    );
    const nextTranslation = await Embeds.getStringTranslation(
      interaction.guild?.id || null,
      "help.translations.next"
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel(previousTranslation)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0 && currentCategoryPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel(nextTranslation)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(
          currentPage === totalPages - 1 &&
            currentCategoryPage ===
              Math.ceil(categories[categoryNames[currentPage]].length / 10) - 1
        )
    );

    await interaction.reply({
      embeds: [await generateEmbed(currentPage, currentCategoryPage)],
      components: [row],
    });

    const filter = (i: ButtonInteraction) =>
      (i.customId === "prev" || i.customId === "next") &&
      i.user.id === interaction.user.id;

    const collector = interaction.channel?.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 120_000,
    });

    collector?.on("collect", async (i) => {
      if (i.customId === "prev") {
        if (currentCategoryPage > 0) {
          currentCategoryPage--;
        } else if (currentPage > 0) {
          currentPage--;
          currentCategoryPage =
            Math.ceil(categories[categoryNames[currentPage]].length / 10) - 1;
        }
      } else if (i.customId === "next") {
        if (
          currentCategoryPage <
          Math.ceil(categories[categoryNames[currentPage]].length / 10) - 1
        ) {
          currentCategoryPage++;
        } else if (currentPage < totalPages - 1) {
          currentPage++;
          currentCategoryPage = 0;
        }
      }

      const previousTranslation = await Embeds.getStringTranslation(
        interaction.guild?.id || null,
        "help.translations.previous"
      );
      const nextTranslation = await Embeds.getStringTranslation(
        interaction.guild?.id || null,
        "help.translations.next"
      );
      await i.update({
        embeds: [await generateEmbed(currentPage, currentCategoryPage)],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel(previousTranslation)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0 && currentCategoryPage === 0),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel(nextTranslation)
              .setStyle(ButtonStyle.Primary)
              .setDisabled(
                currentPage === totalPages - 1 &&
                  currentCategoryPage ===
                    Math.ceil(
                      categories[categoryNames[currentPage]].length / 10
                    ) -
                      1
              )
          ),
        ],
      });
    });

    collector?.on("end", async () => {
      await interaction.editReply({
        components: [],
      });
    });
  } catch (error) {
    cs.error("Error in help command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: false,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: false,
  voteLocked: false,
};