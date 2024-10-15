import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} from "discord.js";
import { getAllGiveaways, GiveawayData } from "../../firebase/giveaways.js";
import { Timestamp } from "firebase-admin/firestore";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const guildId = interaction.guild.id;
    const giveaways = (await getAllGiveaways(guildId)) as
      | GiveawayData[]
      | undefined;

    if (!giveaways || giveaways.length === 0) {
      return interaction.editReply({ content: "No active giveaways found." });
    }

    // Sort giveaways: non-ended first, then by closest endTime
    const sortedGiveaways = giveaways.sort((a, b) => {
      const aEndTime = (a.endTime as unknown as Timestamp).seconds;
      const bEndTime = (b.endTime as unknown as Timestamp).seconds;
      return a.ended === b.ended ? aEndTime - bEndTime : a.ended ? 1 : -1;
    });

    const totalPages = sortedGiveaways.length; // One giveaway per page
    let currentPage = 0;

    const generateEmbed = (page: number) => {
      const giveaway = sortedGiveaways[page];
      const endTime = (giveaway.endTime as unknown as Timestamp).toDate(); // Convert Firestore Timestamp to Date
      const discordTimestamp = `<t:${Math.floor(endTime.getTime() / 1000)}:F>`; // Discord timestamp format

      let details =
        `Prize: **${giveaway.prize}**\n` +
        `Amount of Winners: **${giveaway.winners}**\n` +
        `Entries: **${giveaway.entries.length}**\n` +
        `Host: <@${giveaway.hostId}>\n` +
        `Invite Requirement: **${giveaway.inviteRequirement}**\n` +
        `Status: ${giveaway.ended ? "**Ended**" : "**Ongoing**"}\n` +
        (giveaway.ended
          ? `Ended at: ${discordTimestamp}\n`
          : `Ends at: ${discordTimestamp}\n`) +
        `Channel: ${
          giveaway.channelId ? `<#${giveaway.channelId}>` : "**None**"
        }`;

      // Conditionally add the reward role information
      if (giveaway.rewardRoleId) {
        details += `\nReward Role: <@&${giveaway.rewardRoleId}>`;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Giveaway: ${giveaway.giveawayId}`)
        .setColor(0x00ff00)
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
        .addFields({ name: "Details", value: details });

      return embed;
    };

    const generateButtons = (page: number) => {
      return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );
    };

    const embedMessage = await interaction.editReply({
      embeds: [generateEmbed(currentPage)],
      components: [generateButtons(currentPage)],
    });

    const filter = (i: any) => i.user.id === interaction.user.id;
    const collector = embedMessage.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "previous") {
        currentPage--;
      } else if (i.customId === "next") {
        currentPage++;
      }

      try {
        await i.update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)],
        });
      } catch (error: any) {
        if (error.code === 10008) {
          console.error(
            "Unknown Message: The message was deleted or does not exist."
          );
          // Optionally, notify the user or take other actions
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    });

    collector.on("end", async () => {
      try {
        await embedMessage.edit({
          components: [],
        });
      } catch (error: any) {
        if (error.code === 10008) {
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    });
  } catch (error) {
    console.error(error);

    try {
      interaction.editReply({
        content: "An error occurred while fetching the giveaways.",
      });
    } catch (error) {
      console.error("Error while sending error message:", error);
    }
  }
}
