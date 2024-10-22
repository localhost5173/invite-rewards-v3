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

    if (inviterId) {
        await db.invites.userInvites.decrementReal(guildId, inviterId);
    }
  } catch (error: unknown) {
    cs.error("Error while handling guildMemberRemove event: " + error);
  }
}