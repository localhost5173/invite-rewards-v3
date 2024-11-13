import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { cs } from "../../utils/console/customConsole";

export default async function (interaction: ChatInputCommandInteraction) {
  const amountOfRoles = interaction.options.getInteger("amount", true);

  if (interaction.channel?.type !== ChannelType.GuildText) return;

  const rolesIds: string[] = [];

  let storedInteraction:
    | ChatInputCommandInteraction
    | RoleSelectMenuInteraction = interaction;
  for (let i = 0; i < amountOfRoles; i++) {
    const data = await getRole(storedInteraction);

    if (!data) {
      await interaction.followUp({
        content: "You did not select a role in time.",
        ephemeral: true,
      });
      return;
    }

    storedInteraction = data.interaction;
    rolesIds.push(data.roleId);
  }

  const roleMentions = rolesIds.map((roleId) => `<@&${roleId}>`);
  await storedInteraction.reply({
    content: "Roles selected: " + roleMentions.join(", "),
    ephemeral: true,
  });
}

async function getRole(
  interaction: ChatInputCommandInteraction | RoleSelectMenuInteraction
): Promise<{ roleId: string; interaction: RoleSelectMenuInteraction } | null> {
  try {
    // Create a RoleSelectMenuBuilder
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId("roleSelectMenu")
      .setPlaceholder("Select a role")
      .setMinValues(1)
      .setMaxValues(1);

    // Create an action row and add the select menu to it
    const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      selectMenu
    );

    // Reply to the interaction with the select menu
    await interaction.reply({
      content: "Please select a role:",
      components: [actionRow],
      ephemeral: true,
    });

    return new Promise((resolve) => {
      const collector = (interaction.channel as TextChannel).createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        filter: (i: RoleSelectMenuInteraction) =>
          i.user.id === interaction.user.id && i.customId === "roleSelectMenu",
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
            await interaction.followUp({
              content: "You did not select a role in time.",
              ephemeral: true,
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
      await interaction.followUp({
        content: "An error occurred while setting up the role select menu.",
        ephemeral: true,
      });
    }
    return null;
  }
}