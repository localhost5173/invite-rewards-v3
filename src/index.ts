import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { Client } from "eris";
import handleCommands from "./handlers/command/commandHandler.js"
import handleEvents from "./handlers/event/handleEvents.js";

const botToken = process.env.DEV_TOKEN || "";

export const client = new Client(botToken, {
  intents: [
    "guilds",
    "guildMembers",
    "guildInvites",
    "guildMessages", // Temporary
    "messageContent", // Temporary
  ],
});

client.on("messageCreate", (msg) => {
    console.log(msg);
  if (msg.content === "!ping") {
    client.createMessage(msg.channel.id, "Pong!");
  }
});

handleCommands(client);
handleEvents(client);

client.connect();