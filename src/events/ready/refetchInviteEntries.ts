import { client } from "../../index.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db";

export default async function () {
  cs.log("Refetching invite entries...");

  try {
    const oauth2Guilds = await client.guilds.fetch();

    for (const oauth2Guild of oauth2Guilds) {
      const guild = await client.guilds.fetch(oauth2Guild[1].id);
      const invites = await guild.invites.fetch();

      await db.invites.inviteEntries.deleteGuildEntries(guild.id);

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
    }
  } catch (error) {
    cs.error(`Error refetching invite entries: ${error}`);
  }
}