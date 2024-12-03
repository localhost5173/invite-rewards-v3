import { EmbedBuilder } from "discord.js";
import { db } from "../db/db.js";
export class system {
    static async invalidSubcommand(guildId) {
        const language = await db.languages.getLanguage(guildId);
        const languageData = await import(`../../languages/${language}.json`);
        return new EmbedBuilder()
            .setTitle(languageData.general.invalidSubcommand.title)
            .setDescription(languageData.general.invalidSubcommand.description)
            .setColor("#ff0000");
    }
    static async errorWhileExecutingCommand(guildId) {
        const language = await db.languages.getLanguage(guildId);
        const languageData = await import(`../../languages/${language}.json`);
        return new EmbedBuilder()
            .setTitle(languageData.general.errorWhileExecutingCommand.title)
            .setDescription(languageData.general.errorWhileExecutingCommand.description)
            .setColor("#ff0000");
    }
}
