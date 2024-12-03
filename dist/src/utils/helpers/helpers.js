import { Embeds } from "../embeds/embeds.js";
import { cs } from "../console/customConsole.js";
export class Helpers {
    static async trySendCommandError(interaction) {
        try {
            try {
                await interaction.reply({
                    embeds: [
                        await Embeds.system.errorWhileExecutingCommand(interaction.guildId),
                    ],
                    ephemeral: true,
                });
            }
            catch {
                await interaction.followUp({
                    embeds: [
                        await Embeds.system.errorWhileExecutingCommand(interaction.guildId),
                    ],
                    ephemeral: true,
                });
            }
        }
        catch (error) {
            cs.error("Failed to send error message with trySendError: " + error);
        }
    }
}
