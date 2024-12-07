import { EmbedBuilder } from "discord.js";
import { db } from "../../db/db.js";
import { Embeds } from "../embeds.js";

export class add {
  static async success(
    guildId: string,
    amount: number,
    userId: string,
    total: number
  ) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    const data = languageData.invites.bonus.add;
    return new EmbedBuilder()
      .setTitle(data.title)
      .setDescription(
        data.description
          .replace("{amount}", amount.toString())
          .replace("{user}", `<@${userId}>`)
          .replace("{total}", total.toString())
      )
      .setColor(Embeds.color.success);
  }
}

export class remove {
  static async success(
    guildId: string,
    amount: number,
    userId: string,
    total: number
  ) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    const data = languageData.invites.bonus.remove;
    return new EmbedBuilder()
      .setTitle(data.title)
      .setDescription(
        data.description
          .replace("{amount}", amount.toString())
          .replace("{user}", `<@${userId}>`)
          .replace("{total}", total.toString())
      )
      .setColor(Embeds.color.success);
  }
}
