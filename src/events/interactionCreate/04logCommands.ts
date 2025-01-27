import { Interaction } from "discord.js";
import { db } from "../../utils/db/db.js";

export default async function (interaction: Interaction) {
  if (!interaction.isCommand()) return;
  if (!interaction.isChatInputCommand()) return;
  db.usage.logCommand(interaction);
}
