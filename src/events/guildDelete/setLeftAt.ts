import { Guild } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

export default async function (guild: Guild) {
  try {
    await db.guilds.setGuildLeft(guild);
  } catch (error) {
    cs.error(
      "An error occurred while setting the guild as left in the database: " + error
    );
  }
}
