import { Role } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

export default async function (role: Role) {
  try {
    const guildId = role.guild.id;
    const autoroles = await db.autoRoles.getRoles(guildId);

    if (autoroles.includes(role.id)) {
      await db.autoRoles.removeRole(guildId, role.id);
    }
  } catch (error: unknown) {
    cs.error("Error while removing auto-role by event: " + error);
  }
}