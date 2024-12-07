import { EmbedBuilder } from "discord.js";
import { db } from "../db/db.js";
import { getNativeLanguageName } from "../db/categories/languages.js";

class set {
  static async invalidLanguage(guildId: string) {
    const language = await db.languages.getLanguage(guildId);

    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });
    return new EmbedBuilder()
      .setTitle(languageData.language.set.invalidLanguage.title)
      .setDescription(languageData.language.set.invalidLanguage.description)
      .setColor("#ff0000");
  }

  static async noLanguage(guildId: string) {
    const language = await db.languages.getLanguage(guildId);

    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });
    return new EmbedBuilder()
      .setTitle(languageData.language.set.noLanguage.title)
      .setDescription(languageData.language.set.noLanguage.description)
      .setColor("#ff0000");
  }

  static async success(languageMime: string) {
    const language = getNativeLanguageName(languageMime);
    const languageData = await import(`../../languages/${languageMime}.json`, {
      assert: { type: "json" },
    });
    return new EmbedBuilder()
      .setTitle(languageData.language.set.success.title)
      .setDescription(
        languageData.language.set.success.description.replace(
          "{language}",
          language
        )
      )
      .setColor("#00FF00");
  }
}

class view {
  static async success(languageMime: string) {
    const language = getNativeLanguageName(languageMime);
    const languageData = await import(`../../languages/${languageMime}.json`, {
      assert: { type: "json" },
    });
    return new EmbedBuilder()
      .setTitle(languageData.language.view.success.title)
      .setDescription(
        languageData.language.view.success.description.replace(
          "{language}",
          language
        )
      )
      .setColor("#00FF00");
  }
}

export class languages {
  static set = set;
  static view = view;
}
