import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { devMode } from "../../bot.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export const data: CommandData = {
  name: "who-used",
  description: "See all the joins from a specific invite link",
  options: [
    {
      name: "link",
      description: "The invite link to check",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const link = interaction.options.getString("link", true);
    const guildId = interaction.guildId!;

    await interaction.deferReply();

    if (!link) {
      return interaction.followUp({
        embeds: [await Embeds.createEmbed(guildId, "whoUsed.noLink")],
        ephemeral: true,
      });
    }

    const inviteCode = extractInviteCode(link);
    const inviteesList = await db.invites.usedInvites.getUsedByByCode(
      guildId,
      inviteCode
    );

    // Check if inviteesList is empty
    if (inviteesList.length === 0) {
      return interaction.followUp({
        embeds: [await Embeds.createEmbed(guildId, "whoUsed.noUsers")],
      });
    } else {
      // Mention all invitees
      const inviteeMentionList = inviteesList.map(
        (invitee) => `<@!${invitee}>`
      );
      interaction.followUp({
        embeds: [
          await Embeds.createEmbed(guildId, "whoUsed.success", {
            link: inviteCode,
            users: inviteeMentionList.join("\n"),
          }),
        ],
      });
      db.usage.incrementUses(guildId, UsageCommands.WhoUsed);
    }
  } catch (error) {
    cs.error(
      "Error while getting users who joined using the invite code: " + error
    );

    await Helpers.trySendCommandError(interaction);
  }
}

function extractInviteCode(link: string): string {
  const inviteCodePattern = /(?:https?:\/\/)?discord\.gg\/([a-zA-Z0-9]+)/;
  const match = link.match(inviteCodePattern);
  return match ? match[1] : link;
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
