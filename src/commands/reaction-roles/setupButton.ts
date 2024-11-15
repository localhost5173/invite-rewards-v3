import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { cs } from "../../utils/console/customConsole";

export default async function (interaction: ChatInputCommandInteraction) {
  const amountOfRoles = interaction.options.getInteger("amount", true);

  if (interaction.channel?.type !== ChannelType.GuildText) return;

  const rolesIds: string[] = [];
  const buttonNames: string[] = [];
  const buttonStyles: number[] = [];

  // Create an initial embed
  const embed = new EmbedBuilder()
    .setTitle("Role Selection")
    .setDescription("Please select the roles:")
    .setColor(0x00ff00);

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });

  let storedInteraction: Interaction = interaction;

  for (let i = 0; i < amountOfRoles; i++) {
    const data = await getRole(storedInteraction, i + 1, amountOfRoles);

    if (!data) {
      await storedInteraction.editReply({
        content: "You did not select a role in time.",
        components: [],
      });
      return;
    }

    rolesIds.push(data.roleId);

    const buttonNameData = await getButtonName(data.interaction);

    if (!buttonNameData) {
      await storedInteraction.editReply({
        content: "You did not enter a name in time.",
        components: [],
      });
      return;
    }

    const buttonName = buttonNameData.buttonName;
    buttonNames.push(buttonName);

    // Reset the fields on the embed
    embed.spliceFields(0, embed.data.fields?.length || 0);

    // Add fields for each button name and corresponding role
    for (let j = 0; j < buttonNames.length; j++) {
      embed.addFields({
        name: `Button ${j + 1}`,
        value: `${buttonNames[j]} - <@&${rolesIds[j]}>`,
        inline: true,
      });
    }

    // Update the embed with the selected roles
    await storedInteraction.editReply({
      embeds: [embed],
      components: [],
    });

    const buttonStyleData = await getButtonStyle(buttonNameData.interaction);

    if (!buttonStyleData) {
      await storedInteraction.editReply({
        content: "You did not select a button style in time.",
        components: [],
      });
      return;
    }

    const buttonStyle = buttonStyleData.buttonStyle;
    storedInteraction = buttonStyleData.interaction;
    buttonStyles.push(buttonStyle);

    // Reset the fields on the embed
    embed.spliceFields(0, embed.data.fields?.length || 0);

    // Add fields for each button name, corresponding role, and button style
    for (let j = 0; j < buttonNames.length; j++) {
      embed.addFields({
        name: `Button ${j + 1}`,
        value: `${buttonNames[j]} - <@&${rolesIds[j]}> - ${ButtonStyle[buttonStyle]}`,
        inline: true,
      });
    }

    // Update the embed with the selected roles and styles
    await storedInteraction.editReply({
      embeds: [embed],
      components: [],
    });
  }

  const roleMentions = rolesIds.map((roleId) => `<@&${roleId}>`);
  embed.setDescription("Roles selected: " + roleMentions.join(", "));
  await interaction.editReply({
    embeds: [embed],
    components: [],
  });

  const actionRow = new ActionRowBuilder<ButtonBuilder>();
  // Send the buttons to the channel
  for (let i = 0; i < rolesIds.length; i++) {
    const button = new ButtonBuilder()
      .setCustomId(`roleButton_${i}`)
      .setLabel(buttonNames[i])
      .setStyle(buttonStyles[i]);

    actionRow.addComponents(button);
  }

  await interaction.channel.send({
    content: "Click a button to get the role.",
    components: [actionRow],
  });
}


async function getRole(
  interaction: ChatInputCommandInteraction | StringSelectMenuInteraction,
  currentRole: number,
  totalRoles: number
): Promise<{ roleId: string; interaction: RoleSelectMenuInteraction } | null> {
  try {
    cs.log("Getting role " + currentRole);
    // Create a RoleSelectMenuBuilder
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId(`roleSelectMenu_${currentRole}`)
      .setPlaceholder(`Select role ${currentRole} of ${totalRoles}`)
      .setMinValues(1)
      .setMaxValues(1);

    // Create an action row and add the select menu to it
    const actionRow =
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectMenu);

    // Update the embed with the current role selection prompt
    await interaction.editReply({
      content: `Please select role ${currentRole} of ${totalRoles}:`,
      components: [actionRow],
    });

    return new Promise((resolve) => {
      const collector = (
        interaction.channel as TextChannel
      ).createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        filter: (i: RoleSelectMenuInteraction) =>
          i.user.id === interaction.user.id &&
          i.customId === `roleSelectMenu_${currentRole}`,
        time: 60_000,
      });

      collector?.on("collect", async (i: RoleSelectMenuInteraction) => {
        const roleId = i.values[0];
        cs.log("Role selected: " + roleId);

        resolve({ roleId, interaction: i });
      });

      collector?.on("end", async (collected) => {
        if (collected.size === 0) {
          if (!interaction.deferred && !interaction.replied) {
            await interaction.editReply({
              content: "You did not select a role in time.",
              components: [],
            });
          }
          cs.log("No roles selected");
          resolve(null);
        }
      });
    });
  } catch (error) {
    cs.error("An error occurred in getRole: " + error);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.editReply({
        content: "An error occurred while setting up the role select menu.",
        components: [],
      });
    }
    return null;
  }
}

async function getButtonName(interaction: RoleSelectMenuInteraction) {
  cs.log("Getting button name");
  const modal = new ModalBuilder()
    .setTitle("Button Name")
    .setCustomId("buttonNameModal");

  const buttonNameField = new TextInputBuilder()
    .setLabel("Button Name")
    .setPlaceholder("Enter the name of the button")
    .setCustomId("buttonNameField")
    .setStyle(TextInputStyle.Short);

  const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    buttonNameField
  );
  modal.addComponents(actionRow);

  await interaction.showModal(modal);

  // Await the user's response to the modal
  try {
    const modalInteraction = await interaction.awaitModalSubmit({
      filter: (i) =>
        i.user.id === interaction.user.id && i.customId === "buttonNameModal",
      time: 30_000,
    });

    const buttonName =
      modalInteraction.fields.getTextInputValue("buttonNameField");

    await modalInteraction.deferUpdate();  // Acknowledge the modal submission
    return { buttonName, interaction: modalInteraction };  // Update stored interaction
  } catch (error) {
    cs.error("No response to the modal in time or another error occurred: " + error);
    return null;
  }
}

async function getButtonStyle(
  interaction: RoleSelectMenuInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
): Promise<{
  buttonStyle: number;
  interaction: StringSelectMenuInteraction;
} | null> {
  cs.log("Getting button style");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("buttonStyleSelectMenu")
    .setPlaceholder("Select the style of the button")
    .addOptions([
      { label: "Primary", value: "1" },
      { label: "Secondary", value: "2" },
      { label: "Success", value: "3" },
      { label: "Danger", value: "4" },
    ]);

  const actionRow =
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  await interaction.editReply({
    content: "Please select the style of the button:",
    components: [actionRow],
  });

  return new Promise((resolve) => {
    const collector = (
      interaction.channel as TextChannel
    ).createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      filter: (i) =>
        i.user.id === interaction.user.id &&
        i.customId === "buttonStyleSelectMenu",
      time: 60_000,
    });

    collector?.on("collect", async (i: StringSelectMenuInteraction) => {
      const buttonStyle = parseInt(i.values[0]);
      cs.log("Button style selected: " + buttonStyle);

      try {
        await i.update({ content: "Button style selected.", components: [] }); // Acknowledge the selection
        resolve({ buttonStyle, interaction: i }); // Update stored interaction
      } catch (error) {
        cs.error("Failed to update interaction: " + error);
        resolve(null);
      }
    });

    collector?.on("end", async (collected) => {
      if (collected.size === 0) {
        if (!interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: "You did not select a button style in time.",
            components: [],
          });
        }
        cs.log("No button style selected");
        resolve(null);
      }
    });
  });
}