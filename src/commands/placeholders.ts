import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { Embeds } from "../utils/embeds/embeds.js";
import { db } from "../utils/db/db.js";
import { devMode } from "../index.js";
import { cs } from "../utils/console/customConsole.js";
import { Helpers } from "../utils/helpers/helpers.js";
import { UsageCommands } from "../utils/db/models/usageModel.js";

export const data: CommandData = {
  name: "placeholders",
  description:
    "See all the placeholders that can be used in invite messages and embeds",
};

export async function run({ interaction }: SlashCommandProps) {
  let language = "en";

  try {
    if (interaction.guildId) {
      language = await db.languages.getLanguage(interaction.guildId);
    }

    const languageData = await import(`../languages/${language}.json`, {
      assert: { type: "json" },
    });
    const placeholderData = languageData.default.placeholders;

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
    const embed = await Embeds.createEmbed(
      interaction.guildId,
      "placeholders.embed",
      {
        placeholders: placeholdersString,
      }
    );

    await interaction.reply({ embeds: [embed] });
    db.usage.incrementUses(interaction.guildId ?? "", UsageCommands.PlaceholdersView);
  } catch (error) {
    cs.error("error in placeholders.ts: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: false,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: false,
  voteLocked: false,
};
