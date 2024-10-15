import { ChatInputCommandInteraction } from "discord.js";
import { getGiveaway, GiveawayData, setEndDate } from "../../firebase/giveaways.js";
import { endGiveaway } from "../../utils/giveaways/endGiveaway.js";

export default async function (interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;
  const giveawayId = interaction.options.getString("id", true);


  await interaction.deferReply({ ephemeral: true });

  try {
    // Set the end of the giveaway to now
    const giveaway = await getGiveaway(interaction.guildId, giveawayId) as GiveawayData | undefined;

    if (!giveaway) {
      interaction.followUp({
        content: "Giveaway does not exist.",
        ephemeral: true,
      });
      return;
    }

    if (giveaway.ended) {
      interaction.followUp({
        content: "Giveaway has already ended.",
        ephemeral: true,
      });
      return;
    }

    await setEndDate(interaction.guildId, giveawayId, new Date());

    // Trigger end giveaway
    if (interaction.guild) {
      await endGiveaway(interaction.guild, giveawayId);
    } else {
      await interaction.followUp({
        content: "An error occurred: Guild not found.",
        ephemeral: true,
      });
    }

    await interaction.followUp({
      content: `Giveaway with ID **${giveawayId}** has been ended!`,
      ephemeral: true,
    });
  } catch (error: any) {
    console.error(error);

    switch (error.message) {
      case "Giveaway does not exist":
        await interaction.followUp({
          content: "The giveaway does not exist.",
          ephemeral: true,
        });
        break;
      default:
        await interaction.followUp({
          content: "An error occurred while ending the giveaway.",
          ephemeral: true,
        });
        break;
    }
  }
}