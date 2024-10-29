import { EmbedBuilder } from "discord.js";
import config from "../../../config.json" assert { type: "json" };
import { system } from "./system";
import { autoRoles } from "./autoRoles";
import { languages } from "./languages";
import { roles } from "./roles";
import { invites } from "./invites";

type EmbedOptions = {
  footerIcon?: boolean;
  footerText?: string;
  timestamp?: boolean;
  authorIcon?: boolean;
  authorText?: string;
  title?: string;
  url?: string;
  thumbnail?: string;
  image?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
};

class color {
  static success = 0x00FF00;
  static error = 0xFF0000;
  static info = 0x0000FF;
  static warn = 0xFFA500;
}

export class Embeds {
  public static successEmbed(
    message: string,
    options?: EmbedOptions
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setDescription(message);

    if (options) {
      if (options.footerText) {
        embed.setFooter({
          text: options.footerText,
          iconURL: options.footerIcon ? config.bot.logo : undefined,
        });
      }
      if (options.timestamp) {
        embed.setTimestamp();
      }
      if (options.authorText) {
        embed.setAuthor({
          name: options.authorText,
          iconURL: options.authorIcon ? config.bot.logo : undefined,
        });
      }
      if (options.title) {
        embed.setTitle(options.title);
      }
      if (options.url) {
        embed.setURL(options.url);
      }
      if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
      }
      if (options.image) {
        embed.setImage(options.image);
      }
      if (options.fields) {
        embed.addFields(options.fields);
      }
    }

    return embed;
  }

  public static errorEmbed(
    message: string,
    options?: EmbedOptions
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setDescription(message);

    if (options) {
      if (options.footerText) {
        embed.setFooter({
          text: options.footerText,
          iconURL: options.footerIcon ? config.bot.logo : undefined,
        });
      }
      if (options.timestamp) {
        embed.setTimestamp();
      }
      if (options.authorText) {
        embed.setAuthor({
          name: options.authorText,
          iconURL: options.authorIcon ? config.bot.logo : undefined,
        });
      }
      if (options.title) {
        embed.setTitle(options.title);
      }
      if (options.url) {
        embed.setURL(options.url);
      }
      if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
      }
      if (options.image) {
        embed.setImage(options.image);
      }
      if (options.fields) {
        embed.addFields(options.fields);
      }
    }

    return embed;
  }

  public static infoEmbed(
    message: string,
    options?: EmbedOptions
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor("#0000FF")
      .setDescription(message);

    if (options) {
      if (options.footerText) {
        embed.setFooter({
          text: options.footerText,
          iconURL: options.footerIcon ? config.bot.logo : undefined,
        });
      }
      if (options.timestamp) {
        embed.setTimestamp();
      }
      if (options.authorText) {
        embed.setAuthor({
          name: options.authorText,
          iconURL: options.authorIcon ? config.bot.logo : undefined,
        });
      }
      if (options.title) {
        embed.setTitle(options.title);
      }
      if (options.url) {
        embed.setURL(options.url);
      }
      if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
      }
      if (options.image) {
        embed.setImage(options.image);
      }
      if (options.fields) {
        embed.addFields(options.fields);
      }
    }

    return embed;
  }

  public static warnEmbed(
    message: string,
    options?: EmbedOptions
  ): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor("#FFA500")
      .setDescription(message);

    if (options) {
      if (options.footerText) {
        embed.setFooter({
          text: options.footerText,
          iconURL: options.footerIcon ? config.bot.logo : undefined,
        });
      }
      if (options.timestamp) {
        embed.setTimestamp();
      }
      if (options.authorText) {
        embed.setAuthor({
          name: options.authorText,
          iconURL: options.authorIcon ? config.bot.logo : undefined,
        });
      }
      if (options.title) {
        embed.setTitle(options.title);
      }
      if (options.url) {
        embed.setURL(options.url);
      }
      if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
      }
      if (options.image) {
        embed.setImage(options.image);
      }
      if (options.fields) {
        embed.addFields(options.fields);
      }
    }

    return embed;
  }

  static system = system;
  static autoRoles = autoRoles;
  static languages = languages;
  static roles = roles;
  static invites = invites;

  static color = color;
}
