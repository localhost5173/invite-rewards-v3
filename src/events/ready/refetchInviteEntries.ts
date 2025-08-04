import { PermissionFlagsBits } from "discord.js";
import { client } from "../../index.js";
import { cs } from "../../utils/console/customConsole.js";
import { db } from "../../utils/db/db.js";

export default async function () {
  cs.log("Refetching invite entries...");

  // Wait for database connection
  if (!db.isConnected()) {
    cs.warn("Database not connected yet, waiting...");
    const connected = await db.waitForConnection(30000);
    if (!connected) {
      cs.error("Database connection timeout, skipping invite entries refetch");
      return;
    }
  }

  try {
    const oauth2Guilds = await client.guilds.fetch();

    for (const oauth2Guild of oauth2Guilds) {
      try {
        const guild = await client.guilds.fetch(oauth2Guild[1].id);

        if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
          cs.warn("Bot does not have the necessary permissions to refetch invite entries in guild: " + guild.name);
          continue;
        }

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
      } catch {
        cs.error(
          `Error refetching invite entries for guild ${oauth2Guild[1].id}`
        );
      }
    }
  } catch (error) {
    cs.error(`Error refetching invite entries: ${error}`);
  }
}
