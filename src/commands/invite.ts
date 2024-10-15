import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { inviteEmbed, inviteRow } from "../utils/embeds/system.js";
import { devMode } from "../index.js";

export const data: CommandData = {
  name: "invite",
  description: "Invite the bot to your server!",
};

export async function run({ interaction }: SlashCommandProps) {
  const embed = inviteEmbed();
  const row = inviteRow();

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};