import type { ValidationProps } from "commandkit";
import botconfig from "../../config.json" assert { type: "json" };
import { Embeds } from "../utils/embeds/embeds";
import { cs } from "../utils/console/customConsole";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

// Create a vote button
const voteButton = new ButtonBuilder()
  .setStyle(ButtonStyle.Link)
  .setLabel("Vote")
  .setURL(botconfig.bot.vote);

// Create an action row with the vote button
const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  voteButton
);

// Main validation function
export default async function ({ interaction, commandObj }: ValidationProps) {
  try {
    if (commandObj.options?.voteLocked) {
      // Check if the user has voted
      if (!(await hasVoted(interaction.user.id))) {
        if ("reply" in interaction) {
          // Reply with an error embed if the user has not voted
          return interaction.reply({
            content: "You must vote for the bot to use this command.",
            embeds: [
              Embeds.errorEmbed(
                "You must vote for the bot to use this command. Use `/vote` or visit the bot's top.gg page to vote.",
                {
                  title: "Vote for the bot",
                  url: botconfig.bot.vote,
                }
              ),
            ],
            components: [actionRow],
            ephemeral: true,
          });
        }

        return true;
      }
    }
  } catch (error: unknown) {
    // Log the error and reply with a generic error message
    cs.error(`Failed to fetch voting data from Top.gg: ${error}`);
    if ("reply" in interaction) {
      return interaction.reply({
        content:
          "Failed to fetch voting data from Top.gg. Please try again later.",
        ephemeral: true,
      });
    }
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

    console.log(data);

    return data.voted;
  } catch (error) {
    console.error(`Error in hasVoted function: ${error}`);
    throw error;
  }
}