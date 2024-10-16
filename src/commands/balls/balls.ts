import { CommandData, CommandOptions, Permissions, SlashCommandProps } from "../../types.js";

export const data : CommandData = {
    name: "balls",
    description: "balls",
};

export async function run({ interaction, client }: SlashCommandProps) {
    await interaction.createMessage("pong!");
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: [Permissions.Administrator],
  botPermissions: [Permissions.Administrator],
  deleted: false,
};