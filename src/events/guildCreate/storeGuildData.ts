import { Guild } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

export default async function (guild: Guild) {
  db.guilds.updateGuild(guild);
}
