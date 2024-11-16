import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { Embeds } from "../../utils/embeds/embeds";
import setupButton from "./setupButton";

export const data: CommandData = {
  name: "reaction-roles",
  description: "Manage reaction roles",
  options: [
    {
      name: "button",
      description: "Manage button reaction roles",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "create",
          description: "Create button-based reaction role(s) (interactive)",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "amount",
              description: "The amount of roles to create",
              type: ApplicationCommandOptionType.Integer,
              min_value: 1,
              max_value: 5,
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const subcommandGroup = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand(false);

  const command = `${subcommandGroup ? `${subcommandGroup} ` : ""}${
    subcommand ? subcommand : ""
  }`;

  switch (command) {
    case "button create":
      await setupButton(interaction);
      break;
    default:
      await interaction.reply({
        embeds: [
          await Embeds.createEmbed(
            interaction.guildId!,
            "general.invalidSubcommand"
          ),
        ],
        ephemeral: true,
      });
  }
}

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["Administrator"],
  botPermissions: ["Administrator"],
  deleted: false,
  onlyGuild: true,
  voteLocked: false,
};
