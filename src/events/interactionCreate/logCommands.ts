import { Interaction } from "discord.js";
import { db } from "../../utils/db/db.js";

export default async function (interaction: Interaction) {
  if (!interaction.isCommand()) return;
  if (!interaction.isChatInputCommand()) return;
  console.log("Logging command usage for " + interaction.user.id);
  await db.usage.logCommand(interaction);
}
