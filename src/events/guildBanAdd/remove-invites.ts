import {
  GuildBan,
} from "discord.js";
import { devMode } from "../../index.js";
import {
  decrementRealInvites,
  getInviterForUser,
  getTotalInvitesForUser,
  removeUserFromUsedInvites,
} from "../../firebase/invites.js";
import handleRewards from "../../utils/rewards/handleRewards.js";
import updateTimedLeaderboards from "../../utils/leaderboards/updateTimedLeaderboards.js";
import updateAllTimeLeaderboard from "../../utils/leaderboards/updateAllTimeLeaderboard.js";

export default async function (ban : GuildBan) {
  if (ban.user.bot) return; // Ignore bot accounts
  devMode ?? console.log(`${ban.user.tag} left the server.`);

  const guildId = ban.guild.id;
  try {
    // Remove the user from the usedBy array in the used-invites collection
    const inviterId = await getInviterForUser(guildId, ban.user.id);

    if (inviterId) {
      // Remove the user from the usedBy array
      const previousInvites = await getTotalInvitesForUser(guildId, inviterId);
      await decrementRealInvites(guildId, inviterId);
      await removeUserFromUsedInvites(guildId, ban.user.id);

      const inviter = await ban.guild.members.fetch(inviterId);
      await handleRewards(guildId, inviter.user, previousInvites);
      await updateAllTimeLeaderboard(guildId, inviterId)
      await updateTimedLeaderboards(guildId, inviterId, -1);

      devMode ??
        console.log(
          `${ban.user.tag} left, they were invited by ${inviterId}.`
        );
    }
  } catch (error) {
    console.error(
      `Failed to process banRemove for ${ban.guild.name}:`,
      error
    );
  }
}