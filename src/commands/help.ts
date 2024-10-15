import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { devMode } from "../index.js";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PartialGroupDMChannel,
} from "discord.js";
import botconfig from "../../botconfig.json" assert { type: "json" };

// Define the command data
export const data: CommandData = {
  name: "help",
  description: "Displays a list of all available commands.",
};

// Define the command options
export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: [],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};

// Define the type for commands
interface Command {
  name: string;
  description: string;
}

// Define the type for categories
interface Categories {
  [key: string]: Command[];
}

// Define the run function
export async function run({ interaction }: SlashCommandProps) {
  const categories: Categories = {
    "Invite Management": [
      {
        name: "add-fake-invites",
        description: "Adds fake invites to a user.",
      },
      {
        name: "invited-list",
        description: "Get all the users invited by a specific user",
      },
      {
        name: "inviter",
        description: "Check who invited a user",
      },
      {
        name: "invites",
        description: "Displays the number of invites a user has made!",
      },
      {
        name: "remove-fake-invites",
        description: "Remove fake invites from a user",
      },
      {
        name: "who-used",
        description: "See all the joins from a specific invite link",
      },
    ],
    "Auto Role Management": [
      {
        name: "add-auto-role",
        description: "Assign a role to a user when they join the server",
      },
      {
        name: "remove-auto-role",
        description: "Remove a role from the auto-roles list",
      },
      {
        name: "view-auto-roles",
        description: "View all the auto-roles for this server",
      },
    ],
    "Giveaway Management": [
      {
        name: "giveaway create",
        description: "Create a giveaway in the server",
      },
      {
        name: "giveaway end",
        description: "End a giveaway in the server",
      },
      {
        name: "giveaway reroll",
        description: "Reroll a giveaway in the server",
      },
      {
        name: "giveaway view",
        description: "View all the giveaways in the server",
      },
      {
        name: "giveaway delete",
        description: "Delete a giveaway in the server",
      }
    ],
    "Channel Management": [
      {
        name: "remove-info-channel",
        description: "Removes the information channel for your server",
      },
      {
        name: "remove-leave-channel",
        description: "Removes the leaves channel for your server",
      },
      {
        name: "remove-welcome-channel",
        description: "Removes the welcome channel for your server",
      },
      {
        name: "set-info-channel",
        description: "Set the information channel for your server",
      },
      {
        name: "set-leave-channel",
        description: "Set a leave channel for your server",
      },
      {
        name: "set-welcome-channel",
        description: "Set a welcome channel for your server",
      },
    ],
    "Blacklist Management": [
      {
        name: "blacklist",
        description: "Blacklist a user or role from all leaderboards.",
      },
      {
        name: "remove-from-blacklist",
        description: "Remove a user or role from the blacklist.",
      },
      {
        name: "view-blacklist",
        description: "View the current blacklist for users and roles.",
      },
    ],
    "Leaderboard Management": [
      {
        name: "leaderboard",
        description: "Displays the top inviters in the server.",
      },
      {
        name: "smart-leaderboard",
        description:
          "Displays an auto-updating leaderboard based on the selected type.",
      },
    ],
    "Reward Management": [
      {
        name: "add-invite-reward",
        description: "Creates a reward for a specific invite count.",
      },
      {
        name: "fill-bank",
        description: "Fill a link bank with links.",
      },
      {
        name: "remove-reward",
        description: "Delete a reward from the server by its invite threshold.",
      },
      {
        name: "view-rewards",
        description: "View the invite rewards for this server",
      },
    ],
    "Verification Management": [
      {
        name: "remove-verification",
        description: "Removes the verification system from the server",
      },
      {
        name: "setup-verification-pin",
        description:
          "Creates a verification system with a random pin that a user must enter to get verified.",
      },
      {
        name: "setup-verification-question",
        description:
          "Creates a verification system with a question that users have to answer",
      },
      {
        name: "setup-verification-simple",
        description: "Creates a button-based verification system",
      },
    ],
    Miscellaneous: [
      {
        name: "embed",
        description:
          "Creates a custom embed that may or may not be used as the welcome/leave message.",
      },
      {
        name: "invite",
        description: "Invite the bot to your server!",
      },
      {
        name: "placeholders",
        description:
          "See all the placeholders that can be used in invite messages and embeds",
      },
      {
        name: "help",
        description: "Displays a list of all available commands.",
      },
    ],
  };

  if (interaction.channel instanceof PartialGroupDMChannel) {
    return interaction.reply({
      content: "This command is not available in group DMs.",
      ephemeral: true,
    });
  }

  const categoryNames = Object.keys(categories);
  const totalPages = categoryNames.length;

  let currentPage = 0;

  const generateEmbed = (page: number) => {
    const category = categoryNames[page];
    const commands = categories[category];

    const embed = new EmbedBuilder()
      .setTitle(`Help - ${category}`)
      .setDescription("Here are all the available commands:")
      .setColor(0x00ae86)
      .setThumbnail(botconfig.logo)
      .setTimestamp()
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

    commands.forEach((command) => {
      embed.addFields({
        name: `${"`/"}${command.name}${"`"}`,
        value: command.description,
      });
    });

    // Add the guide and invite link
    embed.addFields(
      {
        name: "Feedback",
        value: "If you have any feedback, want to report a bug or suggest a new feature, please use the `/feedback` command. Your feedback is greatly appreciated!",
        inline: false,
      },
      {
        name: "Invite Me",
        value: `[Click to invite me to your server!](${botconfig.inviteLink})`,
        inline: true,
      },
      {
        name: "Guide",
        value: `[Click for the bot guide.](${botconfig.guide})`,
        inline: true,
      },
      {
        name: "Support Server",
        value: `[Click to join the support server!](${botconfig.server})`,
        inline: true,
      },
    );

    return embed;
  };

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === totalPages - 1)
  );

  await interaction.reply({
    embeds: [generateEmbed(currentPage)],
    components: [row],
    ephemeral: true,
  });

  const filter = (i: any) => i.customId === "prev" || i.customId === "next";

  const collector = interaction.channel?.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    time: 60000,
  });

  collector?.on("collect", async (i) => {
    if (i.customId === "prev" && currentPage > 0) {
      currentPage--;
    } else if (i.customId === "next" && currentPage < totalPages - 1) {
      currentPage++;
    }

    await i.update({
      embeds: [generateEmbed(currentPage)],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages - 1)
        ),
      ],
    });
  });

  collector?.on("end", async () => {
    await interaction.editReply({
      components: [],
    });
  });
}