import { Client } from "eris";
import config from "../../../config.json" assert { type: "json" };
import getLocalCommands from "../../utils/getLocalCommands.js";
import getApplicationCommands from "../../utils/getApplicationCommands.js";
import { CommandObject } from "../../types.js";

export default async function (client: Client) {
    const localCommands = await getLocalCommands([]);

    try {
        const localCommands = await getLocalCommands([]);
        const applicationCommands = await getApplicationCommands(client, config.dev.testGuilds[0]);

        for (const localCommand of localCommands) {
            const { data, run, options } = localCommand;

            const existingCommand = applicationCommands.find((command) => command.name === data.name);

            if (existingCommand) {
                
            }
        }
    } catch (error) {
        console.error("Error registering commands: " + error);
    }
}