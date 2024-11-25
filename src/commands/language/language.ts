import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { devMode } from "../../index.js";
import { ApplicationCommandOptionType } from "discord.js";
import setLanguage from "./set.js";
import viewLanguage from "./view.js";
import {
  LanguagesList,
  TranslatedLanguages,
} from "../../utils/db/categories/languages.js";
import { Embeds } from "../../utils/embeds/embeds.js";

export const data: CommandData = {
  name: "language",
  description: "Change the language of the bot",
  options: [
    {
      name: "set",
      description: "Set the language of the bot",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "language",
          description: "The language to set",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: Object.entries(LanguagesList).map(([value]) => ({
            name: TranslatedLanguages[value as LanguagesList],
            value,
          })),
        },
      ],
    },
    {
      name: "view",
      description: "View the current language of the bot",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const subcommand = interaction.options.getSubcommand(true);

  switch (subcommand) {
    case "set":
      await setLanguage(interaction);
      break;
    case "view":
      await viewLanguage(interaction);
      break;
    default:
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "general.invalidSubcommand"
          ),
        ],
        ephemeral: true,
      });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
};
