import { Client } from "eris";

export default async function (client : Client, guildId: string) {
    let applicationCommands;

    if (guildId) {
        applicationCommands = await client.getGuildCommands(guildId);
    } else {
        applicationCommands = await client.getCommands();
    }

    return applicationCommands;
}