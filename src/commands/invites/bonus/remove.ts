import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { db } from "../../../utils/db/db";
import { Helpers } from "../../../utils/helpers/helpers";
import { Embeds } from "../../../utils/embeds/embeds";

export default async function (interaction: ChatInputCommandInteraction) {
  try {
    const user = interaction.options.getUser("user", true);
    const count = interaction.options.getInteger("count", true);

    await interaction.deferReply({ ephemeral: true });

    await db.invites.userInvites.addBonus(
      interaction.guildId!,
      user.id,
      -count
    );

    const invites = await db.invites.userInvites.getRealAndBonusInvites(
      interaction.guildId!,
      user.id
    );

    await interaction.followUp({
      embeds: [
        await Embeds.invites.bonus.remove.success(
          interaction.guildId!,
          count,
          user.id,
          invites
        ),
      ],
    });
  } catch (error: unknown) {
    cs.error("Error while handling bonus-invites remove command: " + error);

    await Helpers.trySendCommandError(interaction);
  }
}
