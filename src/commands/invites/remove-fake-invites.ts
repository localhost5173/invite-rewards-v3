import type {
  CommandOptions,
} from "commandkit";
import { ChatInputCommandInteraction } from "discord.js";
import {
  addFakeInvites,
  getTotalInvitesForUser,
} from "../../firebase/invites.ts"; // Import the addFakeInvite function
import handleRewards from "../../utils/rewards/handleRewards.ts";
import updateAllTimeLeaderboard from "../../utils/leaderboards/updateAllTimeLeaderboard.ts";
import updateTimedLeaderboards from "../../utils/leaderboards/updateTimedLeaderboards.ts";
import { removeFakeInvitesEmbed } from "../../utils/embeds/invites.ts";
import { devMode } from "../../index.ts";
import { hasVoted } from "../../utils/topgg/voteLock.ts";
import { voteLockedCommandEmbed } from "../../utils/embeds/system.ts";

export default async function (interaction : ChatInputCommandInteraction) {
  if (!(await hasVoted(interaction.user.id))) {
    return interaction.reply({
      embeds: [voteLockedCommandEmbed()],
      ephemeral: true,
    });
  }
  const targetUser = interaction.options.getUser("user");
  const amount = interaction.options.getInteger("count");
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp("This command can only be used in a guild.");
  }

  if (!targetUser) {
    return interaction.followUp("User not found.");
  }

  if (amount === null || amount < 0) {
    return interaction.followUp(
      "Please provide a valid non-negative invite count."
    );
  }

  try {
    // Use the addFakeInvite function to update the fake invite count
    const previousInvites = await getTotalInvitesForUser(
      guildId,
      targetUser.id
    );
    await addFakeInvites(guildId, targetUser.id, -amount);
    await updateAllTimeLeaderboard(guildId, targetUser.id);
    await updateTimedLeaderboards(guildId, targetUser.id, -amount);

    const userInvites = await getTotalInvitesForUser(guildId, targetUser.id);

    const embed = removeFakeInvitesEmbed(targetUser, amount, userInvites);
    interaction.followUp({ embeds: [embed] });

    // Handle rewards
    await handleRewards(guildId, targetUser, previousInvites);
    return;
  } catch (error) {
    console.error(
      `Failed to add fake invites for user ${targetUser.id}:`,
      error
    );
    return interaction.followUp("An error occurred while adding the invites.");
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};
