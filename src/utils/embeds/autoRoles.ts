import { EmbedBuilder, Guild } from "discord.js";
import { db } from "../db/db.js";
import { Embeds } from "./embeds.js";

class view {
  static async success(
    guildId: string,
    autoRoles: string[],
    guildIcon: string
  ) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    const fields = autoRoles.map((role: string) => ({
      name: "\n",
      value: `<@&${role}>`,
      inline: true,
    }));

    return new EmbedBuilder()
      .setColor(Embeds.color.info)
      .setTitle(languageData.autoRoles.view.success.title)
      .setDescription(languageData.autoRoles.view.success.description)
      .addFields(fields)
      .setThumbnail(guildIcon);
  }
}

class add {
  static async alreadyAutoRoleWarning(guildId: string, roleId: string) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.warn)
      .setTitle(languageData.autoRoles.add.alreadyAutoRoleWarning.title)
      .setDescription(
        languageData.autoRoles.add.alreadyAutoRoleWarning.description.replace(
          "{role}",
          `<@&${roleId}>`
        )
      );
  }

  static async success(guildId: string, roleId: string) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.success)
      .setTitle(languageData.autoRoles.add.success.title)
      .setDescription(
        languageData.autoRoles.add.success.description.replace(
          "{role}",
          `<@&${roleId}>`
        )
      );
  }
}

class remove {
  static async notAutoRoleError(guildId: string, roleId: string) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.error)
      .setTitle(languageData.autoRoles.remove.notAutoRoleError.title)
      .setDescription(
        languageData.autoRoles.remove.notAutoRoleError.description.replace(
          "{role}",
          `<@&${roleId}>`
        )
      );
  }

  static async success(guildId: string, roleId: string) {
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.success)
      .setTitle(languageData.autoRoles.remove.success.title)
      .setDescription(
        languageData.autoRoles.remove.success.description.replace(
          "{role}",
          `<@&${roleId}>`
        )
      );
  }
}

class assign {
  static async noManageRolesPermissionError(guild: Guild, dm = false) {
    const guildId = guild.id;
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.error)
      .setTitle(
        languageData.autoRoles.assign.noManageRolesPermissionError.title
      )
      .setDescription(
        dm
          ? languageData.autoRoles.assign.noManageRolesPermissionError.dmDescription.replace(
              "{serverName}",
              guild.name
            )
          : languageData.autoRoles.assign.noManageRolesPermissionError
              .description
      )
      .setFooter({
        text: languageData.autoRoles.assign.noManageRolesPermissionError.footer
          .text,
        iconURL: guild.members.me?.user.displayAvatarURL() || undefined,
      })
      .setTimestamp()
      .setThumbnail(guild.iconURL() || null);
  }

  static async hierarchyRoleAssignError(guild: Guild, dm = false) {
    const guildId = guild.id;
    const language = await db.languages.getLanguage(guildId);
    const languageData = await import(`../../languages/${language}.json`, {
      assert: { type: "json" },
    });

    return new EmbedBuilder()
      .setColor(Embeds.color.error)
      .setTitle(languageData.autoRoles.assign.hierarchyRoleAssignError.title)
      .setDescription(
        dm
          ? languageData.autoRoles.assign.hierarchyRoleAssignError.dmDescription.replace(
              "{serverName}",
              guild.name
            )
          : languageData.autoRoles.assign.hierarchyRoleAssignError.description
      )
      .setFooter({
        text: languageData.autoRoles.assign.hierarchyRoleAssignError.footer
          .text,
        iconURL: guild.members.me?.user.displayAvatarURL() || undefined,
      })
      .setThumbnail(guild.iconURL() || null)
      .setTimestamp();
  }
}

export class autoRoles {
  static add = add;
  static view = view;
  static remove = remove;
  static assign = assign;
}
