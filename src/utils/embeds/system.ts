import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import botconfig from "../../../botconfig.json" assert { type: "json" };

export function botJoinEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("🤖 Welcome to Invite Rewards! 🎉")
    .setDescription(
      "Thank you for inviting me to your server! I'm here to make your Discord experience more fun and efficient. 🚀"
    )
    .setColor(0x7289da) // Discord Blurple
    .addFields(
      {
        name: "📚 Get Started",
        value: "Use `/help` to see all my commands and how to use them.",
      },
      {
        name: "🌟 Features",
        value:
          "I offer invite tracking, invite-based rewards, utility commands, and much more!",
      },
      {
        name: "🔗 Links",
        value: `[Website](${botconfig.website}) | [Support Server](${botconfig.server}) | [Invite Me](${botconfig.inviteLink})`,
      }
    )
    .setThumbnail(botconfig.logo)
    .setFooter({
      text: "Invite Rewards - Grow your server like a pro!",
      iconURL: botconfig.logo,
    });

  return embed;
}

// Function to create an embed for placeholders
export function placeholdersEmbed(
  placeholders: { name: string; description: string }[]
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📋 Placeholders 📋")
    .setColor(0x00ff00) // Green color to indicate information
    .setDescription(
      "These placeholders can be used in the `/set-invite-channel`, `/set-leave-channel` commands and `/embed` if you set the embed as a welcome or leave message."
    )
    .setFooter({ text: "Invite Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
    .setTimestamp();

  placeholders.forEach((placeholder) => {
    embed.addFields({
      name: placeholder.name,
      value: placeholder.description,
      inline: true,
    });
  });

  return embed;
}

// Function to create an embed for errors
export function placeholdersErrorEmbed(errorMessage: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("❌ Error ❌")
    .setColor(0xff0000) // Red color to indicate error
    .setDescription(errorMessage)
    .setFooter({ text: "Invite Management", iconURL: botconfig.logo }) // Replace with your footer icon URL
    .setTimestamp();

  return embed;
}

export function inviteEmbed() {
  return new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Invite the Bot")
    .setDescription(
      "Click the buttons below to invite the bot to your server or visit our website!"
    );
}

export function inviteRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Invite Bot")
      .setStyle(ButtonStyle.Link)
      .setURL(botconfig.inviteLink),
    new ButtonBuilder()
      .setLabel("Support Server")
      .setStyle(ButtonStyle.Link)
      .setURL(botconfig.server),
    new ButtonBuilder()
      .setLabel("Visit Website")
      .setStyle(ButtonStyle.Link)
      .setURL(botconfig.website)
  );
}

export function addBotEmbed() {
  return new EmbedBuilder()
    .setTitle("Thank You for Adding the Bot!")
    .setDescription(
      "We are excited to be a part of your server. Here are some tips to get started... If you are unsure about something, feel free to visit the bot's guide or join the support server."
    )
    .addFields(
      {
        name: "📚 Get Started",
        value: "Use `/help` to see all my commands and how to use them.",
      },
      {
        name: "🌟 Features",
        value:
          "I offer invite tracking, invite-based rewards, utility commands, and much more!",
      },
      {
        name: "🔗 Links",
        value: `[Guide](${botconfig.guide}) | [Website](${botconfig.website}) | [Support Server](${botconfig.server}) | [Invite Me](${botconfig.inviteLink})`,
      }
    )
    .setColor("#00FF00")
    .setTimestamp();
}

export function noPermissionsEmbed() {
  return new EmbedBuilder()
    .setTitle("Missing Permissions")
    .setDescription(
      "The bot requires the `Manage Server` permission to function properly. Please ensure the bot has the necessary permissions."
    )
    .setColor("#FF0000");
}

export function voteLockedCommandEmbed() {
  return new EmbedBuilder()
    .setTitle("Vote Required")
    .setDescription(
      "You must vote for the bot to use this command. Use `/vote` or visit the bot's top.gg page to vote."
    )
    .setColor("#FF0000");
}

export function voteForBotEmbed() {
  return new EmbedBuilder()
    .setTitle("Vote for the Bot")
    .setDescription(
      "Vote for the bot on top.gg to unlock special features and support the developers!"
    )
    .setColor("#0099ff");
}