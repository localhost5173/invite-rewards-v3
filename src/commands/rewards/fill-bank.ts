import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";
import { fillBankById } from "../../firebase/rewards.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import {
  fillBankErrorEmbed,
  fillBankSuccessEmbed,
} from "../../utils/embeds/rewards.js";
import { devMode } from "../../index.js";

export const data: CommandData = {
  name: "fill-bank",
  description: "Fill a link bank with links.",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "invites",
      description: "Amount of invites required to unlock the reward",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "links",
      description: "The links to fill the bank with in a .txt file",
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const guildId = interaction.guild?.id;
  const invites = interaction.options.getInteger("invites");
  const linksDocument = interaction.options.getAttachment("links");

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    const embed = fillBankErrorEmbed(
      "This command can only be used in a server."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  if (!invites) {
    const embed = fillBankErrorEmbed(
      "You must provide the amount of invites required to unlock the reward."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  let links;

  if (!linksDocument || linksDocument.name.endsWith(".txt") === false) {
    const embed = fillBankErrorEmbed("Please provide a valid .txt file.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  try {
    // Fetch the file content from the attachment URL
    const response = await fetch(linksDocument.url);
    const textContent = await response.text();

    // Split the content by newlines to get an array of links
    links = textContent
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    if (links.length === 0) {
      const embed = fillBankErrorEmbed("The link bank file is empty.");
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error("Error fetching or parsing the link bank file:", error);
    const embed = fillBankErrorEmbed("Failed to process the link bank file.");
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  try {
    const bankFilled = await fillBankById(guildId, invites, links);
    if (bankFilled) {
      const embed = fillBankSuccessEmbed(
        `The link bank for ${invites} invites has been successfully filled up.`
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      const embed = fillBankErrorEmbed("No reward found with the given ID.");
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error(error);
    const embed = fillBankErrorEmbed(
      "An error occurred while trying to fill the bank."
    );
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ['SendMessages', 'EmbedLinks'],
  deleted: false,
};
