import { devMode } from "../../index.js";
import { ApplicationCommandOptionType } from "discord.js";
import setLanguage from "./set.js";
import viewLanguage from "./view.js";
import { LanguagesList, TranslatedLanguages, } from "../../utils/db/categories/languages.js";
import { Embeds } from "../../utils/embeds/embeds.js";
export const data = {
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
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    choices: Object.entries(LanguagesList).map(([key, value]) => ({
                        name: TranslatedLanguages[value],
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
export async function run({ interaction }) {
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
                    await Embeds.createEmbed(interaction.guildId, "general.invalidSubcommand"),
                ],
                ephemeral: true,
            });
    }
}
export const options = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};
