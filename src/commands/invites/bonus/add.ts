import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole.js";
import { db } from "../../../utils/db/db.js";
import { Helpers } from "../../../utils/helpers/helpers.js";
import { Embeds } from "../../../utils/embeds/embeds.js";
import { Leaderboards } from "../../../utils/leaderboards/Leaderboards.js";
import { Rewards } from "../../../utils/rewards/Rewards.js";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const user = interaction.options.getUser("user", true);
    const count = interaction.options.getInteger("count", true);

    await interaction.deferReply({ ephemeral: true });

    await db.invites.userInvites.addBonus(interaction.guildId!, user.id, count);
    await Leaderboards.updateLeaderboards(interaction.guildId!, user.id);
    await Rewards.handleGiveRewards(interaction.guildId!, user.id);
    const invites = await db.invites.userInvites.getRealAndBonusInvites(
      interaction.guildId!,
      user.id,
      "alltime"
    );

    await interaction.followUp({
      embeds: [
        await Embeds.createEmbed(interaction.guildId!, "bonusInvites.add", {
          amount: count.toString(),
          user: `<@${user.id}>`,
          total: invites.toString(),
        }),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while handling bonus-invites add command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
