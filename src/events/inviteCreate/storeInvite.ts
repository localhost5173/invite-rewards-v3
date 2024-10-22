import { Invite } from "discord.js";
import { db } from "../../utils/db/db";
import { cs } from "../../utils/console/customConsole";

export default async function (invite: Invite) {
    try {
        if (!invite.guild) return;
        const guildId = invite.guild.id;

        // Create the invite entry
        const inviteEntry = {
            guildId: guildId,
            code: invite.code,
            expiresAt: invite.expiresAt,
            inviterId: invite.inviter?.id,
            maxUses: invite.maxUses,
            uses: invite.uses,
        };

        // Add the invite entry to the database
        await db.invites.inviteEntries.addEntry(inviteEntry);
        cs.dev("Invite entry added successfully");
    } catch (error) {
        console.error(
            `Failed to store invite ${invite.code}`,
            error
        );
    }
}