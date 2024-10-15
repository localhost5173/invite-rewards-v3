import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";
import { setVerificationRole } from "../../firebase/verification.js";
import {
  errorEmbed,
  pinVerificationButton,
  pinVerificationEmbed,
  successEmbed,
} from "../../utils/embeds/verification.js";
import { devMode } from "../../index.js";
import { hasVoted } from "../../utils/topgg/voteLock.js";
import { voteLockedCommandEmbed } from "../../utils/embeds/system.js";

export default async function (interaction : ChatInputCommandInteraction) {
  if (!(await hasVoted(interaction.user.id))) {
    return interaction.reply({
      embeds: [voteLockedCommandEmbed()],
      ephemeral: true,
    });
  }
  const guildId = interaction.guild?.id;
  const channel = interaction.options.getChannel("channel");
  const role = interaction.options.getRole("role");

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp({
      embeds: [errorEmbed("This command can only be used in a guild.")],
    });
  }

  if (!channel) {
    return interaction.followUp({
      embeds: [errorEmbed("Please provide a valid channel.")],
    });
  }

  if (!role) {
    return interaction.followUp({
      embeds: [errorEmbed("Please provide a valid role.")],
    });
  }

  if (channel.type !== ChannelType.GuildText) {
    return interaction.followUp({
      embeds: [errorEmbed("Please provide a valid text channel.")],
    });
  }

  // Fetch the bot's GuildMember object
  const botMember = await interaction.guild.members.fetch(
    interaction.client.user.id
  );

  // Check if the bot has permission to manage roles
  if (!botMember.permissions.has("ManageRoles")) {
    return interaction.followUp({
      embeds: [errorEmbed("The bot does not have permission to manage roles.")],
    });
  }

  // Check if the bot's highest role is above the role it tries to manage
  if (botMember.roles.highest.comparePositionTo(role.id) <= 0) {
    return interaction.followUp({
      embeds: [
        errorEmbed(
          "The bot's highest role is not above the role it tries to manage. Move the bot's role above the role you want to use for verification."
        ),
      ],
    });
  }

  try {
    setVerificationRole(guildId, role.id);

    const embed = pinVerificationEmbed();
    const button = pinVerificationButton();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    (channel as GuildTextBasedChannel).send({
      embeds: [embed],
      components: [row],
    });

    interaction.followUp({
      embeds: [successEmbed("Verification set up successfully")],
    });
  } catch (error) {
    console.error(error);
    interaction.followUp({
      embeds: [
        errorEmbed(
          "An error occurred while setting up the verification system."
        ),
      ],
    });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "ManageRoles", "EmbedLinks"],
  deleted: false,
};
