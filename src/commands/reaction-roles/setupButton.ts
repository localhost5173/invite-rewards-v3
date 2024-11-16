import {
    ActionRowBuilder,
    AutocompleteInteraction,
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

    const embed = createInitialEmbed("Please select the roles:");

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });

    let storedInteraction: Interaction = interaction;

    for (let i = 0; i < amountOfRoles; i++) {
        const roleData = await getRole(storedInteraction, i + 1, amountOfRoles);
        if (!roleData) return await handleTimeout(storedInteraction, "role");

        rolesIds.push(roleData.roleId);

        const buttonNameData = await getButtonName(roleData.interaction);
        if (!buttonNameData) return await handleTimeout(storedInteraction, "button name");

        buttonNames.push(buttonNameData.buttonName);

        updateEmbedFields(embed, buttonNames, rolesIds);
        await storedInteraction.editReply({ embeds: [embed] });

        const buttonStyleData = await getButtonStyle(buttonNameData.interaction);
        if (!buttonStyleData) return await handleTimeout(storedInteraction, "button style");

        buttonStyles.push(buttonStyleData.buttonStyle);
        storedInteraction = buttonStyleData.interaction;

        updateEmbedFields(embed, buttonNames, rolesIds, buttonStyles);
        await storedInteraction.editReply({ embeds: [embed] });
    }

    finalizeEmbed(embed, rolesIds);
    await interaction.editReply({ embeds: [embed] });

    const actionRow = createActionRow(buttonNames, buttonStyles);
    await interaction.channel.send({
        embeds: [new EmbedBuilder().setDescription("Click a button to get the role.").setColor(0x00ff00)],
        components: [actionRow],
    });
}

function createInitialEmbed(description: string) {
    return new EmbedBuilder()
        .setTitle(description)
        .setColor(0x00ff00);
}

function updateEmbedFields(embed: EmbedBuilder, buttonNames: string[], rolesIds: string[], buttonStyles?: number[]) {
    embed.setTitle("Please select the roles:");
    embed.spliceFields(0, embed.data.fields?.length || 0);
    for (let i = 0; i < buttonNames.length; i++) {
        embed.addFields({
            name: `Button ${i + 1}`,
            value: `${buttonNames[i]} - <@&${rolesIds[i]}>${buttonStyles ? ` - ${ButtonStyle[buttonStyles[i]]}` : ''}`,
            inline: true,
        });
    }
}

function finalizeEmbed(embed: EmbedBuilder, rolesIds: string[]) {
    const roleMentions = rolesIds.map((roleId) => `<@&${roleId}>`);
    embed.setTitle("Roles selected:");
    embed.setDescription(roleMentions.join(", "));
}

function createActionRow(buttonNames: string[], buttonStyles: number[]) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 0; i < buttonNames.length; i++) {
        const button = new ButtonBuilder()
            .setCustomId(`roleButton_${i}`)
            .setLabel(buttonNames[i])
            .setStyle(buttonStyles[i]);
        actionRow.addComponents(button);
    }
    return actionRow;
}

async function handleTimeout(interaction: Interaction, type: string) {
    if (interaction instanceof AutocompleteInteraction) {
        return;
    }
    await interaction.editReply({
        embeds: [new EmbedBuilder().setDescription(`You did not select a ${type} in time.`).setColor(0xff0000)],
    });
}

async function getRole(
    interaction: ChatInputCommandInteraction | StringSelectMenuInteraction,
    currentRole: number,
    totalRoles: number
): Promise<{ roleId: string; interaction: RoleSelectMenuInteraction } | null> {
    try {
        cs.log("Getting role " + currentRole);
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId(`roleSelectMenu_${currentRole}`)
            .setPlaceholder(`Select role ${currentRole} of ${totalRoles}`)
            .setMinValues(1)
            .setMaxValues(1);

        const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectMenu);

        await interaction.editReply({
            embeds: [createInitialEmbed(`Please select role ${currentRole} of ${totalRoles}:`)],
            components: [actionRow],
        });

        return new Promise((resolve) => {
            const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
                componentType: ComponentType.RoleSelect,
                filter: (i: RoleSelectMenuInteraction) =>
                    i.user.id === interaction.user.id && i.customId === `roleSelectMenu_${currentRole}`,
                time: 60_000,
            });

            collector?.on("collect", async (i: RoleSelectMenuInteraction) => {
                const roleId = i.values[0];
                cs.log("Role selected: " + roleId);
                resolve({ roleId, interaction: i });
            });

            collector?.on("end", async (collected) => {
                if (collected.size === 0) {
                    await handleTimeout(interaction, "role");
                    resolve(null);
                }
            });
        });
    } catch (error) {
        cs.error("An error occurred in getRole: " + error);
        await handleTimeout(interaction, "role");
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

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(buttonNameField);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    try {
        const modalInteraction = await interaction.awaitModalSubmit({
            filter: (i) => i.user.id === interaction.user.id && i.customId === "buttonNameModal",
            time: 30_000,
        });

        const buttonName = modalInteraction.fields.getTextInputValue("buttonNameField");
        await modalInteraction.deferUpdate();
        return { buttonName, interaction: modalInteraction };
    } catch (error) {
        cs.error("No response to the modal in time or another error occurred: " + error);
        return null;
    }
}

async function getButtonStyle(
    interaction: RoleSelectMenuInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
): Promise<{ buttonStyle: number; interaction: StringSelectMenuInteraction } | null> {
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

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [createInitialEmbed("Please select the style of the button:")],
        components: [actionRow],
    });

    return new Promise((resolve) => {
        const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            filter: (i) => i.user.id === interaction.user.id && i.customId === "buttonStyleSelectMenu",
            time: 60_000,
        });

        collector?.on("collect", async (i: StringSelectMenuInteraction) => {
            const buttonStyle = parseInt(i.values[0]);
            cs.log("Button style selected: " + buttonStyle);

            try {
                await i.update({ embeds: [createInitialEmbed("Button style selected.")], components: [] }); // Acknowledge the selection
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
                        embeds: [new EmbedBuilder().setDescription("You did not select a button style in time.").setColor(0xff0000)],
                        components: [],
                    });
                }
                cs.log("No button style selected");
                resolve(null);
            }
        });
    });
}