import { ChatInputCommandInteraction } from "discord.js";
import { db } from "../../../utils/db/db";
import { cs } from "../../../utils/console/customConsole";
import { Helpers } from "../../../utils/helpers/helpers";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell"
) {
  try {
    const guildId = interaction.guildId!;
    const channel = interaction.options.getChannel("channel", true);
    const channelId = channel.id;

    await interaction.deferReply({ ephemeral: true });

    if (type === "welcome") {
      await db.welcomer.setWelcomeChannel(guildId, channelId);
    } else {
      await db.welcomer.setFarewellChannel(guildId, channelId);
    }

    await interaction.followUp({
      content: `${type} channel set to <#${channelId}>`,
      ephemeral: true,
    });
  } catch (error) {
    cs.error(`Error while setting ${type} channel: ` + error);

    await Helpers.trySendCommandError(interaction);
  }
}
