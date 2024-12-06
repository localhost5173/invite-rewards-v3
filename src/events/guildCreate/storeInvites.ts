import { Guild } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

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

            db.invites.inviteEntries.addEntry(inviteEntry);
        });
    } catch (error: unknown) {
        cs.error("Failed to store invites on guildCreate: " + error);
    }
}