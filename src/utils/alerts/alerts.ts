import { EmbedBuilder } from "discord.js";
import { cs } from "../console/customConsole.js";
import { client } from "../../bot.js";

export class alerts {
  static async alertServerOwner(
    guildId: string,
    options: { message?: string; embed?: EmbedBuilder }
  ) {
    try {
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
        cs.error(
          `Guild with ID ${guildId} not found while trying to alert server owner.`
        );
        return;
      }

      const owner = await guild.fetchOwner();
      if (!owner) {
        cs.error(
          `Owner of guild with ID ${guildId} not found while trying to alert server owner..`
        );
        return;
      }

      if (!owner.user) {
        cs.error(
          `Owner user object for guild with ID ${guildId} not found while trying to alert server owner..`
        );
        return;
      }

      if (options.embed) {
        await owner.send({ embeds: [options.embed] }).catch((error) => {
          cs.error(
            `Failed to send embed to owner of guild with ID ${guildId}: ${error}`
          );
        });
      } else if (options.message) {
        await owner.send(options.message).catch((error) => {
          cs.error(
            `Failed to send message to owner of guild with ID ${guildId}: ${error}`
          );
        });
      } else {
        cs.error(
          `No message or embed provided for alert to owner of guild with ID ${guildId}.`
        );
      }
    } catch (error: unknown) {
      cs.error(
        `Error while sending alert to server owner of guild with ID ${guildId}: ${error}`
      );
    }
  }

  static async alertInfoChannel(
    guildId: string,
    options: { message?: string; embed?: EmbedBuilder }
  ) {
    try {
      options.embed = options.embed?.setTimestamp();
      cs.warn("Alerting info channel not implemented yet.");
    } catch (error: unknown) {
      cs.error(
        `Error while sending alert to info channel of guild with ID ${guildId}: ${error}`
      );
    }
  }
}
