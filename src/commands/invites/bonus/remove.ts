import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole.js";
import { db } from "../../../utils/db/db.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
import { Leaderboards } from "../../../utils/leaderboards/Leaderboards.js";
import { Rewards } from "../../../utils/rewards/Rewards.js";
import { UsageCommands } from "../../../utils/db/models/usageModel.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const user = interaction.options.getUser("user", true);
    const count = interaction.options.getInteger("count", true);
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });

    await db.invites.userInvites.addBonus(
      guildId,
      user.id,
      -count
    );
    await Leaderboards.updateLeaderboards(guildId, user.id);
    await Rewards.handleGiveRewards(guildId, user.id);

    const invites = await db.invites.userInvites.getRealAndBonusInvites(
      guildId,
      user.id,
      "alltime"
    );

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(guildId, "bonusInvites.remove", {
          amount: count.toString(),
          user: `<@${user.id}>`,
          total: invites.toString(),
        }),
      ],
    });
    db.usage.incrementUses(guildId, UsageCommands.BonusInvitesRemove);
  } catch (error: unknown) {
    cs.error("Error while handling bonus-invites remove command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
