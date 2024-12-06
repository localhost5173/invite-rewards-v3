import { Embeds } from "../utils/embeds/embeds.js";
import { db } from "../utils/db/db.js";
import { devMode } from "../index.js";
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";
export const data = {
    name: "placeholders",
    description: "See all the placeholders that can be used in invite messages and embeds",
};
export async function run({ interaction }) {
    let language = "en";
    try {
        if (interaction.guildId) {
            language = await db.languages.getLanguage(interaction.guildId);
        }
        const languageData = await import(`../languages/${language}.json`);
        const placeholderData = languageData.placeholders;
        const placeholders = [
            {
                name: "`{mention-user}`",
                description: placeholderData["mention-user"],
            },
            { name: "`{username}`", description: placeholderData["username"] },
            { name: "`{user-tag}`", description: placeholderData["user-tag"] },
            { name: "`{server-name}`", description: placeholderData["server-name"] },
            {
                name: "`{member-count}`",
                description: placeholderData["member-count"],
            },
            { name: "`{inviter-tag}`", description: placeholderData["inviter-tag"] },
            {
                name: "`{inviter-count}`",
                description: placeholderData["inviter-count"],
            },
            {
                name: "`{inviter-real-count}`",
                description: placeholderData["inviter-real-count"],
            },
            {
                name: "`{inviter-bonus-count}`",
                description: placeholderData["inviter-bonus-count"],
            },
        ];
        const placeholdersString = placeholders
            .map((placeholder) => `${placeholder.name} - ${placeholder.description}`)
            .join("\n");
        const embed = await Embeds.createEmbed(interaction.guildId, "placeholders.embed", {
            placeholders: placeholdersString,
        });
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        cs.error("error in placeholders.ts: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
export const options = {
    devOnly: devMode,
    userPermissions: [],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: false,
    voteLocked: false,
};
