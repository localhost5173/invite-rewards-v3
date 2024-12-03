import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { Embeds } from "../utils/embeds/embeds.js";

export const data: CommandData = {
  name: "test",
  description: "test command",
};

export async function run({ interaction }: SlashCommandProps) {
  if (!interaction.guild) return;
  await interaction.reply({
    embeds: [
      await Embeds.autoRoles.assign.noManageRolesPermissionError(interaction.guild, false)
    ],
    ephemeral: true,
  });
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};