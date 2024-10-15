import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  TextChannel,
  DMChannel,
} from "discord.js";
import { setEmbedAsWelcomeOrLeaveMessage } from "../firebase/channels.js";
import { devMode } from "../index.js";
import { CommandData, CommandOptions, SlashCommandProps } from "commandkit";

export const data: CommandData = {
  name: "embed",
  description: "Creates a custom embed that may or may not be used as the welcome/leave message.",
  options: [
    {
      name: "description",
      description: "The description of the embed",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "color",
      description: "The color of the embed in HEX format",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "title",
      description: "The title of the embed",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "url",
      description: "The URL of the embed",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "author",
      description: "The name of the author",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "author_icon",
      description: "The URL of the author icon",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "author_url",
      description: "The URL of the author",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "thumbnail",
      description: "The URL of the thumbnail to attach",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    // Fields
    {
      name: "image",
      description: "The URL of the image to attach",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "timestamp",
      description: "Add a timestamp to the embed",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: "footer",
      description: "The footer text",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: "footer_icon",
      description: "The URL of the footer icon",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  try {
    if (!interaction.guild) {
      return interaction.reply("This command can only be used in a guild.");
    }

    if (!interaction.channel || !(interaction.channel instanceof TextChannel || interaction.channel instanceof DMChannel)) {
      return interaction.reply("This command can only be used in a text or DM channel.");
    }

    const guildId = interaction.guild.id;

    let color = interaction.options.getString("color") || "";
    let title = interaction.options.getString("title") || "";
    let url = interaction.options.getString("url") || "";
    let author = interaction.options.getString("author") || "";
    let authorIcon = interaction.options.getString("author_icon") || "";
    let authorUrl = interaction.options.getString("author_url") || "";
    let description = interaction.options.getString("description") || "";
    let thumbnail = interaction.options.getString("thumbnail") || "";
    let image = interaction.options.getString("image") || "";
    let timestamp = interaction.options.getBoolean("timestamp") || false;
    let footer = interaction.options.getString("footer") || "";
    let footerIcon = interaction.options.getString("footer_icon") || "";

    await interaction.deferReply({ ephemeral: true });

    // Convert color to hex
    color = color.startsWith("#") ? color.substring(1) : color; // Remove '#' if present
    const hexColor = parseInt(color, 16); // Convert the hex string to a number

    const embed = new EmbedBuilder();

    if (hexColor) embed.setColor(hexColor);
    if (title) embed.setTitle(title);
    if (url) embed.setURL(url);
    if (author || authorIcon || authorUrl)
      embed.setAuthor({ name: author, iconURL: authorIcon, url: authorUrl });
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (timestamp) embed.setTimestamp();
    if (footer || footerIcon)
      embed.setFooter({ text: footer, iconURL: footerIcon });

    const sendEmbedButton = new ButtonBuilder()
      .setCustomId("send_embed")
      .setLabel("Send Embed")
      .setStyle(ButtonStyle.Success);

    const discardEmbedButton = new ButtonBuilder()
      .setCustomId("discard_embed")
      .setLabel("Discard")
      .setStyle(ButtonStyle.Danger);

    const setAsWelcomeButton = new ButtonBuilder()
      .setCustomId("set_as_welcome")
      .setLabel("Set as Welcome Message")
      .setStyle(ButtonStyle.Secondary);

    const setAsLeaveButton = new ButtonBuilder()
      .setCustomId("set_as_leave")
      .setLabel("Set as Leave Message")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(
      sendEmbedButton,
      setAsWelcomeButton,
      setAsLeaveButton,
      discardEmbedButton
    );

    const reply = await interaction.followUp({
      content: "Embed preview:",
      embeds: [embed],
      components: [row as any],
    });

    const filter = (i: any) => i.user.id === interaction.user.id; // Filter to ensure only the command user can interact
    const collector = reply.createMessageComponentCollector({
      filter,
      time: 60000,
    }); // 1-minute timeout

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "send_embed") {
        await buttonInteraction.update({
          content: "Embed sent!",
          components: [], // Remove buttons
        });
        await (interaction.channel as TextChannel | DMChannel).send({ embeds: [embed] }); // Send the actual embed to the channel
        collector.stop();
      } else if (buttonInteraction.customId === "discard_embed") {
        await buttonInteraction.update({
          content: "Embed discarded.",
          components: [], // Remove buttons
        });
        collector.stop();
      } else if (buttonInteraction.customId === "set_as_welcome") {
        try {
          await setEmbedAsWelcomeOrLeaveMessage(guildId, embed, "welcome");
          await buttonInteraction.update({
            content: "Embed set as welcome message!",
            components: [], // Remove buttons
          });
        } catch (error) {
          console.error(`Failed to set embed as welcome message:`, error);
          return buttonInteraction.update({
            content: "An error occurred while setting the embed as welcome message.",
            components: [], // Remove buttons
          });
        }
        collector.stop();
      } else if (buttonInteraction.customId === "set_as_leave") {
        try {
          await setEmbedAsWelcomeOrLeaveMessage(guildId, embed, "leave");
          await buttonInteraction.update({
            content: "Embed set as leave message!",
            components: [], // Remove buttons
          });
        } catch (error) {
          console.error(`Failed to set embed as leave message:`, error);
          return buttonInteraction.update({
            content: "An error occurred while setting the embed as leave message.",
            components: [], // Remove buttons
          });
        }
        collector.stop();
      }
    });

    // Handle the collector end event (when time runs out or manually stopped)
    collector.on("end", async () => {
      if (!collector.ended) {
        await reply.edit({
          content: "Interaction timed out. No action taken.",
          components: [], // Remove buttons
        });
      }
    });
  } catch (error) {
    console.error(`Failed to create embed:`, error);
    return interaction.followUp("An error occurred while creating the embed.");
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["ManageGuild"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
};