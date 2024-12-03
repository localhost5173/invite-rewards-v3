import { EmbedBuilder, ModalBuilder, TextInputBuilder } from "discord.js";
import { system } from "./system.js";
import { autoRoles } from "./autoRoles.js";
import { languages } from "./languages.js";
import { roles } from "./roles.js";
import { invites } from "./invites.js";
import { db } from "../db/db.js";

class color {
  static success = 0x00ff00;
  static error = 0xff0000;
  static info = 0x0000ff;
  static warn = 0xffa500;
}

export class Embeds {
  static async createEmbed(
    guildId: string | null,
    embedPath: string,
    replacements?: { [key: string]: string }
  ) {
    let language = "en";

    if (guildId) {
      language = await db.languages.getLanguage(guildId);
    }
    const languageData = await import(`../../languages/${language}.json`);

    // Split the embedPath into its components
    const pathComponents = embedPath.split(".");

    // Dynamically access the nested properties
    let data = languageData;
    for (const component of pathComponents) {
      if (data[component] !== undefined) {
        data = data[component];
      } else {
        throw new Error(
          `Path component "${component}" not found in language data.`
        );
      }
    }

    // Function to replace placeholders in a string
    const replacePlaceholders = (text: string): string => {
      if (!replacements) return text;
      if (typeof text !== "string") return text;
      return text.replace(
        /{(\w+)}/g,
        (_, key) => replacements[key] || `{${key}}`
      );
    };

    const embed = new EmbedBuilder();

    // Conditionally append properties to the embed
    if (data.title) embed.setTitle(replacePlaceholders(data.title));
    if (data.description)
      embed.setDescription(replacePlaceholders(data.description));
    if (data.url) embed.setURL(replacePlaceholders(data.url));
    if (data.color) embed.setColor(parseInt(replacePlaceholders(data.color).replace("#", ""), 16));
    if (data.timestamp)
      embed.setTimestamp(new Date(replacePlaceholders(data.timestamp)));
    if (data.footer) {
      if (data.footer.text && data.footer.icon_url)
        embed.setFooter({
          text: replacePlaceholders(data.footer.text),
          iconURL: replacePlaceholders(data.footer.icon_url),
        });
      if (data.footer.text && !data.footer.icon_url)
        embed.setFooter({
          text: replacePlaceholders(data.footer.text),
        });
    }
    if (data.image) embed.setImage(replacePlaceholders(data.image));
    if (data.thumbnail) embed.setThumbnail(replacePlaceholders(data.thumbnail));
    if (data.author)
      embed.setAuthor({
        name: replacePlaceholders(data.author.name),
        url: replacePlaceholders(data.author.url),
        iconURL: replacePlaceholders(data.author.icon_url),
      });
    if (data.fields) {
      const fields = data.fields.map(
        (field: { name: string; value: string; inline?: boolean }) => ({
          name: replacePlaceholders(field.name),
          value: replacePlaceholders(field.value),
          inline: field.inline,
        })
      );
      embed.addFields(fields);
    }

    return embed;
  }

  static async getJson(guildId: string | null, path: string) {
    let language = "en"

    if (guildId) {
      language = await db.languages.getLanguage(guildId);
    }
    const languageData = await import(`../../languages/${language}.json`);

    const pathComponents = path.split(".");

    // Dynamically access the nested properties
    let data = languageData;
    for (const component of pathComponents) {
      if (data[component] !== undefined) {
        data = data[component];
      } else {
        throw new Error(
          `Path component "${component}" not found in language data.`
        );
      }
    }

    return data;
  }

  static async getStringTranslation(guildId: string | null, path: string) {
    let language = "en"

    if (guildId) {
      language = await db.languages.getLanguage(guildId);
    }
    const languageData = await import(`../../languages/${language}.json`);

    const pathComponents = path.split(".");

    // Dynamically access the nested properties
    let data = languageData;
    for (const component of pathComponents) {
      if (data[component] !== undefined) {
        data = data[component];
      } else {
        throw new Error(
          `Path component "${component}" not found in language data.`
        );
      }
    }

    return data;
  }

  static async createModal(guildId: string | null, modalPath: string) {

    let language = "en";
    if (guildId) {
      language = await db.languages.getLanguage(guildId);
    }

    const languageData = await import(`../../languages/${language}.json`);

    // Split the modalPath into its components
    const pathComponents = modalPath.split(".");

    // Dynamically access the nested properties
    let data = languageData;
    for (const component of pathComponents) {
      if (data[component] !== undefined) {
        data = data[component];
      } else {
        throw new Error(
          `Path component "${component}" not found in language data.`
        );
      }
    }

    const modal = new ModalBuilder();

    if (data.title) modal.setTitle(data.title);

    return modal;
  }

  static async createTextField(guildId: string, modalFieldPath: string) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`);

    // Split the modalFieldPath into its components
    const pathComponents = modalFieldPath.split(".");

    // Dynamically access the nested properties
    let data = languageData;
    for (const component of pathComponents) {
      if (data[component] !== undefined) {
        data = data[component];
      } else {
        throw new Error(
          `Path component "${component}" not found in language data.`
        );
      }
    }

    const field = new TextInputBuilder()

    if (data.label) field.setLabel(data.label);
    if (data.placeholder) field.setPlaceholder(data.placeholder);
    if (data.value) field.setValue(data.value);

    return field;
  }

  static system = system;
  static autoRoles = autoRoles;
  static languages = languages;
  static roles = roles;
  static invites = invites;

  static color = color;
}
