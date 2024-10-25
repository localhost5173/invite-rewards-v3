import { GuildMember } from "discord.js";
import { cs } from "../../utils/console/customConsole";
import { db } from "../../utils/db/db";

export default async function (guildMember: GuildMember) {
    try {
        const guildId = guildMember.guild.id;

        const inviterId = await db.invites.joinedUsers.getInviterOfUser(
            guildId,
            guildMember.id
        );

        cs.dev("InviterId: " + inviterId);

        if (inviterId) {
            await db.invites.userInvites.decrementReal(guildId, inviterId);
            await db.invites.usedInvites.removeUserFromUsedBy(guildId, guildMember.id);
            await db.invites.joinedUsers.setLeftAt(guildId, guildMember.id);
        }

        cs.dev(
            `User ${guildMember.user.tag} left the server. Inviter: ${inviterId ? guildMember.guild.members.cache.get(inviterId)?.user.tag : "Unknown"
            }`
        );
        cs.warn("Goodbye message not implemented yet.")
    } catch (error: unknown) {
        cs.error("Error while handling guildMemberRemove event: " + error);
    }
}