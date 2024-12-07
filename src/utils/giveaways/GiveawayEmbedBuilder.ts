import { EmbedBuilder } from "discord.js";
import { db } from "../db/db.js";

export class GiveawayEmbedBuilder {
  static async build(guildId: string, type: string, replacements: { [key: string]: string | number | undefined }) {
    const language = await db.languages.getLanguage(guildId);
    const data = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });
    const languageData = data.default;
    
    const template = languageData.giveaways[type];
    if (!template) {
      throw new Error(`Embed type "${type}" not found in language file`);
    }

    // Replace placeholders in description
    let description = template.description || "";
    for (const key in replacements) {
      const value = replacements[key];
      description = description.replace(new RegExp(`{${key}}`, "g"), value?.toString() || "");
    }

    // Create the embed
    return new EmbedBuilder()
      .setTitle(template.title || "")
      .setDescription(description);
  }
}
