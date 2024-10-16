import path from "path";
import getAllFiles from "./getAllFiles.js";
import { fileURLToPath } from "url";
import { CommandData, CommandObject, CommandOptions } from "../types.js";

// Get the equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (exceptions: string[]) {
  let localCommands = [];

  const commandCategories = await getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );

  console.log("command categories: " + commandCategories);

  for (const commandCategory of commandCategories) {
    const commandFiles = await getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      const commandObject: CommandObject = await import(commandFile);

      if (exceptions.includes(commandObject.data.name)) {
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
}
