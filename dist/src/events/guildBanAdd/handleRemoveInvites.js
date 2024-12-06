import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";
import { Leaderboards } from "../../utils/leaderboards/Leaderboards.js";
import { Rewards } from "../../utils/rewards/Rewards.js";
export default async function (guildMember) {
    try {
        const guildId = guildMember.guild.id;
        const inviterId = await db.invites.joinedUsers.getInviterOfUser(guildId, guildMember.id);
        cs.dev("InviterId: " + inviterId);
        if (inviterId) {
            const isUserVerified = await db.invites.joinedUsers.isUserVerified(guildId, guildMember.id);
            // Decrement the invite count of the inviter
            if (isUserVerified) {
                // Remove real invite from inviter if the user is verified
                await db.invites.userInvites.decrementReal(guildId, inviterId);
                await Leaderboards.updateLeaderboards(guildId, inviterId);
                await Rewards.handleGiveRewards(guildId, inviterId);
            }
            else {
                await db.invites.userInvites.decrementUnverified(guildId, inviterId);
            }
            await db.invites.usedInvites.removeUserFromUsedBy(guildId, guildMember.id);
            await db.invites.joinedUsers.setLeftAt(guildId, guildMember.id);
        }
        cs.dev(`User ${guildMember.user.tag} left the server. Inviter: ${inviterId
            ? guildMember.guild.members.cache.get(inviterId)?.user.tag
            : "Unknown"}`);
        cs.warn("Goodbye message not implemented yet.");
    }
    catch (error) {
        cs.error("Error while handling guildMemberRemove event: " + error);
    }
}
