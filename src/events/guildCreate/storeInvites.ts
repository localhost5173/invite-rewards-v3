import { Guild } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function (guild: Guild) {
    try {
        const invites = await guild.invites.fetch();

        invites.forEach(async (invite) => {
            const inviteEntry = {
                guildId: guild.id,
                code: invite.code,
                expiresAt: invite.expiresAt,
                inviterId: invite.inviter?.id,
                maxUses: invite.maxUses,
                uses: invite.uses,
            };

            await db.invites.inviteEntries.addEntry(inviteEntry);
        });
    } catch (error: unknown) {
        cs.error("Failed to store invites on guildCreate: " + error);
    }
}