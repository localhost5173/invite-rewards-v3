import { ChatInputCommandInteraction } from "discord.js";
import { Embeds } from "../embeds/embeds";
import { cs } from "../console/customConsole";

export class helpers {
  static async trySendCommandError(interaction: ChatInputCommandInteraction) {
    try {
      try {
        await interaction.reply({
          embeds: [
            await Embeds.system.errorWhileExecutingCommand(
              interaction.guildId!
            ),
          ],
          ephemeral: true,
        });
      } catch {
        await interaction.followUp({
          embeds: [
            await Embeds.system.errorWhileExecutingCommand(
              interaction.guildId!
            ),
          ],
          ephemeral: true,
        });
      }
    } catch (error) {
      cs.error("Failed to send error message with trySendError: " + error);
    }
  }
}