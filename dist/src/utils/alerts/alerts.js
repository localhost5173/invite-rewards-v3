import { cs } from "../console/customConsole.js";
import { client } from "../../index.js";
export class alerts {
    static async alertServerOwner(guildId, options) {
        try {
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                cs.error(`Guild with ID ${guildId} not found while trying to alert server owner.`);
                return;
            }
            const owner = await guild.fetchOwner();
            if (!owner) {
                cs.error(`Owner of guild with ID ${guildId} not found while trying to alert server owner..`);
                return;
            }
            if (!owner.user) {
                cs.error(`Owner user object for guild with ID ${guildId} not found while trying to alert server owner..`);
                return;
            }
            if (options.embed) {
                await owner.send({ embeds: [options.embed] }).catch((error) => {
                    cs.error(`Failed to send embed to owner of guild with ID ${guildId}: ${error}`);
                });
            }
            else if (options.message) {
                await owner.send(options.message).catch((error) => {
                    cs.error(`Failed to send message to owner of guild with ID ${guildId}: ${error}`);
                });
            }
            else {
                cs.error(`No message or embed provided for alert to owner of guild with ID ${guildId}.`);
            }
        }
        catch (error) {
            cs.error(`Error while sending alert to server owner of guild with ID ${guildId}: ${error}`);
        }
    }
    static async alertInfoChannel(guildId, options) {
        try {
            options.embed = options.embed?.setTimestamp();
            cs.warn("Alerting info channel not implemented yet.");
        }
        catch (error) {
            cs.error(`Error while sending alert to info channel of guild with ID ${guildId}: ${error}`);
        }
    }
}
