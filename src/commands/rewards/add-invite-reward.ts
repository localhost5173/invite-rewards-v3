import type {
  SlashCommandProps,
  CommandData,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { createInviteReward } from "../../firebase/rewards.js";
import { createRewardEmbed } from "../../utils/embeds/rewards.js";
import { devMode } from "../../index.js";
import { errorEmbed } from "../../utils/embeds/verification.js";

export default async function (interaction : ChatInputCommandInteraction) {
  const type = interaction.options.getString("type");
  const count = interaction.options.getInteger("count");
  const role = interaction.options.getRole("role");
  const link = interaction.options.getString("link");
  const linkBank = interaction.options.getAttachment("link-bank");
  const customReward = interaction.options.getString("custom-reward");
  const removable = interaction.options.getBoolean("removable") ?? false; // Default to false if null
  const guildId = interaction.guild?.id;

  await interaction.deferReply({ ephemeral: true });

  if (!guildId) {
    return interaction.followUp("This command can only be used in a guild.");
  }

  if (count === null || count < 0) {
    return interaction.followUp(
      "Please provide a valid non-negative invite count."
    );
  }

  // Validate and construct reward object
  let reward: {
    type: "role" | "link" | "link-bank";
    role?: string;
    customReward?: string;
    link?: string;
    removable: boolean;
    bank?: string[];
  } = { type: type as "role" | "link" | "link-bank", removable };

  switch (reward.type) {
    case "role":
      if (!role) {
        return interaction.followUp("Please provide a valid role.");
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
      reward.role = role.id;
      break;
    case "link":
      if (!link) {
        return interaction.followUp("Please provide a valid link.");
      }
      reward.link = link;
      break;

    case "link-bank":
      if (!linkBank || linkBank.name.endsWith(".txt") === false) {
        return interaction.followUp("Please provide a valid .txt file.");
      }
      try {
        // Fetch the file content from the attachment URL
        const response = await fetch(linkBank.url);
        const textContent = await response.text();

        // Split the content by newlines to get an array of links
        const links = textContent.split('\n').map(link => link.trim()).filter(Boolean);

        if (links.length === 0) {
          return interaction.followUp("The link bank file is empty.");
        }

        // Store the links in the reward object
        reward.bank = links;
      } catch (error) {
        console.error("Error fetching or parsing the link bank file:", error);
        return interaction.followUp("Failed to process the link bank file.");
      }
      break;
    default:
      return interaction.followUp("Invalid reward type.");
  }

  try {
    await createInviteReward(guildId, count, reward);
    const embed = createRewardEmbed({ ...reward, count });
    interaction.followUp({ embeds: [embed] });
  } catch (error) {
    console.error("Error while setting invite reward:", error);
    interaction.followUp("An error occurred while setting the invite reward.");
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
  deleted: false,
};