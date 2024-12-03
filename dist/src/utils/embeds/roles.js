import { EmbedBuilder } from "discord.js";
import { db } from "../db/db.js";
import { Embeds } from "./embeds.js";
export class roles {
    static async roleNotFoundError(guildId) {
        const language = await db.languages.getLanguage(guildId);
        const languageData = await import(`../../languages/${language}.json`);
        return new EmbedBuilder()
            .setColor(Embeds.color.error)
            .setTitle(languageData.roles.roleNotFoundError.title)
            .setDescription(languageData.roles.roleNotFoundError.description);
    }
    static async managedRoleAssignError(guildId, roleId) {
        const language = await db.languages.getLanguage(guildId);
        const languageData = await import(`../../languages/${language}.json`);
        return new EmbedBuilder()
            .setColor(Embeds.color.error)
            .setTitle(languageData.roles.managedRoleAssignError.title)
            .setDescription(languageData.roles.managedRoleAssignError.description.replace("{role}", `<@&${roleId}>`));
    }
    static async hierarchyRoleAssignError(guildId, roleId) {
        const language = await db.languages.getLanguage(guildId);
        const languageData = await import(`../../languages/${language}.json`);
        return new EmbedBuilder()
            .setColor(Embeds.color.error)
            .setTitle(languageData.roles.hierarchyRoleAssignError.title)
            .setDescription(languageData.roles.hierarchyRoleAssignError.description.replace("{role}", `<@&${roleId}>`));
    }
}
