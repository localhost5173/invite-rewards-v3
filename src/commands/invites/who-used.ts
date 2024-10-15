import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { whoUsed } from "../../firebase/invites.js";
import { whoUsedErrorEmbed, whoUsedJoinsEmbed, whoUsedNoJoinsEmbed } from "../../utils/embeds/invites.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "who-used",
  description: "See all the joins from a specific invite link",
  options: [
    {
      name: "link",
      description: "The invite link to check",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const link = interaction.options.getString("link");
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    const embed = whoUsedErrorEmbed("This command can only be used in a guild.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!link) {
    const embed = whoUsedErrorEmbed("Please provide an invite link to check.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  const inviteCode = extractInviteCode(link);

  try {
    let inviteesList = await whoUsed(guildId, inviteCode);

    // Check if inviteesList is empty
    if (inviteesList.length === 0) {
      const embed = whoUsedNoJoinsEmbed(inviteCode);
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      // Mention all invitees
      const inviteeMentionList = inviteesList.map(
        (invitee) => `<@!${invitee}>`
      );
      const embed = whoUsedJoinsEmbed(inviteCode, inviteeMentionList);
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error(
      `Failed to retrieve joins for invite link ${inviteCode}:`,
      error
    );
    const embed = whoUsedErrorEmbed(
      "An error occurred while retrieving the invite link data."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode, // You can change this depending on whether you want it to be available in development only
  userPermissions: ["ManageGuild"], // Ensure the user has permission to manage the guild
  botPermissions: ['SendMessages', 'EmbedLinks'], // Ensure the bot can read message history
  deleted: false,
};

function extractInviteCode(link: string): string {
  const inviteCodePattern = /(?:https?:\/\/)?discord\.gg\/([a-zA-Z0-9]+)/;
  const match = link.match(inviteCodePattern);
  return match ? match[1] : link;
}