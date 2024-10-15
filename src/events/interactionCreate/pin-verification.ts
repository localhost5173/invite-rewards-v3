import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  PartialGroupDMChannel,
} from "discord.js";
import { giveRole } from "../../utils/verification/giveRole.js";
import { getVerificationRole } from "../../firebase/verification.js";
import { errorEmbed } from "../../utils/embeds/verification.js";
import { devMode } from "../../index.js";

export default async function (interaction: Interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "pin-verification") return;
  if (!interaction.guild) return;
  if (!interaction.channel) return;
  if (interaction.channel instanceof PartialGroupDMChannel) {
    return interaction.reply({
      content: "This command cannot be used in group DMs.",
      ephemeral: true,
    });
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guild.id;
    const roleId = await getVerificationRole(guildId);
    if (!roleId)
      return interaction.followUp({
        embeds: [
          errorEmbed(
            "Verification role not set. Contact the server administrator."
          ),
        ],
        ephemeral: true,
      });

    // Check if the user already has the role
    const member = interaction.member;
    if (member && "cache" in member.roles && member.roles.cache.has(roleId)) {
      return interaction.followUp({
        content: "You are already verified.",
        ephemeral: true,
      });
    }

    const pin = Math.floor(Math.random() * 9000) + 1000;

    // Use fields for PIN and input
    const embed = new EmbedBuilder()
      .setTitle("Verification Required")
      .addFields(
        { name: "PIN", value: `\`${pin}\``, inline: true },
        { name: "Input", value: "` `", inline: true } // Initial empty input
      )
      .setColor(0x00ff00)
      .setFooter({
        text: "Verification System",
        iconURL: "https://example.com/path/to/your/footer-icon.png",
      })
      .setTimestamp();

    const rows = [];
    for (let i = 0; i < 10; i++) {
      const button = new ButtonBuilder()
        .setCustomId(`digit_${i}`)
        .setLabel(`${i}`)
        .setStyle(ButtonStyle.Secondary);

      if (i % 5 === 0) rows.push(new ActionRowBuilder<ButtonBuilder>());
      rows[rows.length - 1].addComponents(button);
    }

    await interaction.followUp({ embeds: [embed], components: rows });

    const filter = (i: Interaction) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    let userInput = "";

    collector.on("collect", async (i: Interaction) => {
      if (!i.isButton()) return;

      const digit = i.customId.split("_")[1];
      userInput += digit;

      // Update the embed to use fields for the actual numbers inputted
      const updatedEmbed = new EmbedBuilder()
        .setTitle("Verification Required")
        .addFields(
          { name: "PIN", value: `\`${pin}\``, inline: true },
          { name: "Input", value: `\`${userInput}\``, inline: true } // Updated to show actual input
        )
        .setColor(0x00ff00)
        .setFooter({
          text: "Verification System",
          iconURL: "https://example.com/path/to/your/footer-icon.png",
        })
        .setTimestamp();

      if (userInput.length >= 4) {
        if (parseInt(userInput) === pin) {
          await i.update({
            content: "Verification successful!",
            components: [],
            embeds: [updatedEmbed],
          });
          await giveRole(interaction, roleId); // Assign the role
        } else {
          await i.update({
            content: "Verification failed. Incorrect PIN.",
            components: [],
            embeds: [updatedEmbed],
          });
          // Optionally, restart the process or end it here
        }
        collector.stop();
      } else {
        await i.update({ embeds: [updatedEmbed] });
      }
    });

    collector.on(
      "end",
      (collected) => devMode ?? console.log(`Collected ${collected.size} items`)
    );
  } catch (error) {
    console.error(error);
    interaction.followUp({
      embeds: [errorEmbed("An error occurred while processing your request.")],
      ephemeral: true,
    });
  }
}
