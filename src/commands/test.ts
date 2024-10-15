import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";

export const data: CommandData = {
  name: "test",
  description: "test command",
};

export async function run({ interaction }: SlashCommandProps) {
  // await sendMessageToInfoChannel(interaction.guild?.id || "", "test");
  await interaction.reply({
    content: "test", 
    ephemeral: true,
  });
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
};