import {
  CommandData,
  CommandOptions,
  Permissions,
  SlashCommandProps,
} from "../types.js";
import { CommandOptionType } from "../types.js";

export const data: CommandData = {
  name: "ban",
  description: "ban a member",
  options: [
    {
      name: "user",
      description: "the user to ban",
      type: CommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "the reason for the ban",
      type: CommandOptionType.String,
      required: false,
    },
  ],
};

export async function run({ interaction, client }: SlashCommandProps) {
  await interaction.createMessage("ban!");
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: [Permissions.ManageGuild],
  botPermissions: [Permissions.Administrator],
  deleted: false,
};
