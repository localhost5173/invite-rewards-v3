import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PartialGroupDMChannel,
  PermissionFlagsBits,
} from "discord.js";
import {
  addMessageChannelIds,
  createGiveaway,
} from "../../firebase/giveaways.js";
import { createGiveawayEmbed } from "../../utils/embeds/giveaways.js";
import { client } from "../../index.js";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;
  if (!interaction.channel) return;

  try {
    if (interaction.channel instanceof PartialGroupDMChannel) {
      return interaction.reply({
        content: "This command is not available in group DMs.",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const duration = interaction.options.getString("duration", true);
    const prize = interaction.options.getString("prize", true);
    const description = interaction.options.getString("description", true);
    const winners = interaction.options.getInteger("winners", true);
    const rewardRole = interaction.options.getRole("reward-role", false);
    const inviteRequirement = interaction.options.getInteger(
      "invite-requirement",
      false
    );

    // Check if the bot can manage the reward role
    if (rewardRole && interaction.guild) {
      const botMember = interaction.guild.members.me;
      if (!botMember) {
        return interaction.followUp({
          content: "I couldn't retrieve my own member information.",
          ephemeral: true,
        });
      }

      const botHighestRole = botMember.roles.highest;
      if (!botHighestRole) {
        return interaction.followUp({
          content: "I couldn't retrieve my highest role.",
          ephemeral: true,
        });
      }

      if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.followUp({
          content:
            "I need the `MANAGE_ROLES` permission to assign the reward role.",
          ephemeral: true,
        });
      }

      if (botHighestRole.position <= rewardRole.position) {
        return interaction.followUp({
          content:
            "My highest role must be higher than the reward role to assign it. Move the Invite Rewards role higher in the role list and try again.",
          ephemeral: true,
        });
      }
    }

    const now = new Date();
    let durationMs: number;

    // Parse the duration string
    const durationValue = parseInt(duration, 10);
    const durationUnit = duration.slice(durationValue.toString().length);

    switch (durationUnit) {
      case "h":
        durationMs = durationValue * 60 * 60 * 1000; // hours to milliseconds
        break;
      case "d":
        durationMs = durationValue * 24 * 60 * 60 * 1000; // days to milliseconds
        break;
      case "w":
        durationMs = durationValue * 7 * 24 * 60 * 60 * 1000; // weeks to milliseconds
        break;
      default:
        durationMs = durationValue * 1000; // default to seconds to milliseconds
        break;
    }

    const endTime = new Date(now.getTime() + durationMs);

    // Create the giveaway in Firestore
    const giveawayId = await createGiveaway(
      interaction.guildId,
      endTime,
      prize,
      description,
      winners,
      interaction.user.id,
      inviteRequirement || 0,
      rewardRole?.id
    );

    const enterGiveawayButton = new ButtonBuilder()
      .setCustomId(`giveaway-enter:${giveawayId}`)
      .setLabel("Enter Giveaway")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      enterGiveawayButton
    );

    const message = await interaction.channel.send({
      embeds: [
        createGiveawayEmbed(
          prize,
          description,
          winners,
          endTime,
          interaction.user.id,
          giveawayId,
          0,
          inviteRequirement || 0,
          rewardRole?.id
        ),
      ],
      components: [row],
    });

    await addMessageChannelIds(
      interaction.guildId,
      giveawayId.toString(),
      message.id,
      interaction.channel.id
    );

    await interaction.followUp({
      content: `Giveaway created for **${prize}** with **${winners}** winner(s) and a duration of **${duration}**! The giveaway ID is **${giveawayId}**.`,
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
    await interaction.followUp({
      content: "An error occurred while creating the giveaway.",
      ephemeral: true,
    });
  }
}
