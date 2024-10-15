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
import {
  removeVerification,
  setVerificationRole,
} from "../../firebase/verification.js";
import {
  errorEmbed,
  simpleVerificationButton,
  simpleVerificationEmbed,
  successEmbed,
} from "../../utils/embeds/verification.js";
import { devMode } from "../../index.js";

export default async function (interaction : ChatInputCommandInteraction) {
  const guildId = interaction.guild?.id;
  const role = interaction.options.getRole("role");
  const channel = interaction.options.getChannel("channel");

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp({
      embeds: [errorEmbed("This command can only be used in a guild.")],
    });
  }

  if (!role) {
    return interaction.followUp({
      embeds: [errorEmbed("Please provide a valid role.")],
    });
  }

  if (!channel || channel.type !== ChannelType.GuildText) {
    return interaction.followUp({
      embeds: [errorEmbed("Please provide a valid channel.")],
    });
  }

  // Fetch the bot's GuildMember object
  const botMember = await interaction.guild.members.fetch(interaction.client.user.id);

  // Check if the bot has permission to manage roles
  if (!botMember.permissions.has("ManageRoles")) {
    return interaction.followUp({
      embeds: [errorEmbed("The bot does not have permission to manage roles.")],
    });
  }

  // Check if the bot's highest role is above the role it tries to manage
  if (botMember.roles.highest.comparePositionTo(role.id) <= 0) {
    return interaction.followUp({
      embeds: [errorEmbed("The bot's highest role is not above the role it tries to manage. Move the bot's role above the role you want to use for verification.")],
    });
  }

  try {
    await removeVerification(guildId);
    await setVerificationRole(guildId, role.id);
    const verificationEmbed = simpleVerificationEmbed();
    const button = simpleVerificationButton();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await (channel as GuildTextBasedChannel).send({
      embeds: [verificationEmbed],
      components: [row],
    });

    interaction.followUp({
      embeds: [successEmbed("Verification set up successfully")],
    });
  } catch (error) {
    console.error(
      "Error occurred while setting up simple verification: ",
      error
    );
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