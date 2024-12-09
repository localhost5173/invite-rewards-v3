import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { devMode } from "../../index.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export const data: CommandData = {
  name: "history",
  description: "See the join and leave history of a user",
  options: [
    {
      name: "user",
      description: "The user to get the history for",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const targetUser = interaction.options.getUser("user", false);
  const guildId = interaction.guildId!;
  const userId = interaction.user.id;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (!targetUser) {
      const noUserEmbed = await Embeds.createEmbed(
        guildId,
        "general.noUserProvided"
      );
      return interaction.followUp({ embeds: [noUserEmbed], ephemeral: true });
    }

    const history = await db.invites.joinedUsers.getHistoryForUser(
      guildId,
      targetUser.id
    );

    if (history.length === 0) {
      const noHistoryEmbed = await Embeds.createEmbed(
        guildId,
        "history.noHistory",
        {
          user: `<@${targetUser.id}>`,
        }
      );
      return interaction.followUp({
        embeds: [noHistoryEmbed],
        ephemeral: true,
      });
    }

    // Create an array of fields for each history entry
    const fields = history.map((entry, index) => {
      const joinedAtTimestamp = `<t:${Math.floor(
        entry.joinedAt.getTime() / 1000
      )}:D> (<t:${Math.floor(entry.joinedAt.getTime() / 1000)}:R>)`;
      const leftAtTimestamp = entry.leftAt
        ? `<t:${Math.floor(entry.leftAt.getTime() / 1000)}:D> (<t:${Math.floor(
            entry.leftAt.getTime() / 1000
          )}:R>)`
        : "Present";

      return {
        name: `Entry #${index + 1}`,
        value: `**Joined:** ${joinedAtTimestamp}\n**Left:** ${leftAtTimestamp}`,
        inline: false,
      };
    });

    const historyEmbed = await Embeds.createEmbed(
      guildId,
      "history.success",
      {
        user: `<@${targetUser.id}>`,
      }
    );

    historyEmbed.addFields(fields);

    interaction.followUp({ embeds: [historyEmbed], ephemeral: true });
    db.usage.incrementUses(guildId, UsageCommands.InviteHistory);
  } catch (error) {
    console.error(`Failed to get invites for user ${userId}:`, error);

    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
