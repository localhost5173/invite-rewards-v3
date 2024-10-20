import { EmbedBuilder } from "discord.js";
import config from "../../../config.json" assert { type: "json" };
import { system } from "./system";
import { autoRoles } from "./autoRoles";
import { languages } from "./languages";
export class Embeds {
    static successEmbed(message, options) {
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
    static errorEmbed(message, options) {
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
    static infoEmbed(message, options) {
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
    static warnEmbed(message, options) {
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
}
