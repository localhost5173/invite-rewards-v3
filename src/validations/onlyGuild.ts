import type { ValidationProps } from "commandkit";

export default function ({ interaction, commandObj }: ValidationProps) {
  if (!interaction.guild && commandObj.options?.onlyGuild) {
    if ("reply" in interaction) {
      interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }
    return true;
  }
}