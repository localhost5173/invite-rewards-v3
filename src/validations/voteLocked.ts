import type { ValidationProps } from "commandkit";
import botconfig from "../../config.json" assert { type: "json" };
import { Embeds } from "../utils/embeds/embeds.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { cs } from "../utils/console/customConsole.js";

// Main validation function
export default async function ({ interaction, commandObj }: ValidationProps) {
  try {
    if (commandObj.options?.voteLocked) {
      const guildId = interaction.guildId!;
      // Check if the user has voted
      cs.dev("Checking if user has voted");
      if (!(await hasVoted(interaction.user.id))) {
        cs.dev("User has not voted");
        const voteTranslation = await Embeds.getStringTranslation(
          guildId,
          "validations.voteTranslation"
        );
        // Create a vote button
        const voteButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel(voteTranslation)
          .setURL(botconfig.bot.vote);

        // Create an action row with the vote button
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          voteButton
        );
        if ("reply" in interaction) {
          // Reply with an error embed if the user has not voted
          return interaction.reply({
            embeds: [
              await Embeds.createEmbed(guildId, "validations.voteLocked"),
            ],
            components: [actionRow],
            ephemeral: true,
          });
        }

        return true;
      }
    }
  } catch (error) {
    cs.error("Error while checking if user has voted: " + error);
    return false;
  }
}

// Function to check if the user has voted
async function hasVoted(userId: string): Promise<boolean> {
  const token = process.env.TOPGG_TOKEN;
  if (!token) throw new Error("TOPGG_TOKEN is not defined");

  try {
    const response = await fetch(
      `https://top.gg/api/bots/${botconfig.bot.topBotId}/check?userId=${userId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    return data.voted;
  } catch (error) {
    console.error(`Error in hasVoted function: ${error}`);
    throw error;
  }
}
