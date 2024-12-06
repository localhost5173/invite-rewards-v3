import { ApplicationCommandType, ApplicationCommandOptionType, } from "discord.js";
import { devMode } from "../../index.js";
import removeAutoRole from "./remove.js";
import addAutoRole from "./add.js";
import viewAutoRoles from "./view.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { cs } from "../../utils/console/customConsole.js";
export const data = {
    name: "auto-roles",
    description: "Manage auto roles",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add-role",
            description: "Assign a role to a user when they join the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role to assign",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: "remove-role",
            description: "Remove a role from being auto-assigned to new members",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role to remove from auto-assign",
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: "view",
            description: "Shows all the auto-assign roles for this server.",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],
};
export async function run({ interaction }) {
    const subcommand = interaction.options.getSubcommand();
    try {
        switch (subcommand) {
            case "add-role":
                await addAutoRole(interaction);
                break;
            case "remove-role":
                await removeAutoRole(interaction);
                break;
            case "view":
                await viewAutoRoles(interaction);
                break;
            default:
                await interaction.reply({
                    embeds: [
                        await Embeds.createEmbed(interaction.guildId, "general.invalidSubcommand"),
                    ],
                    ephemeral: true,
                });
        }
    }
    catch (error) {
        cs.error("Error in auto-roles.ts: " + error);
        await Helpers.trySendCommandError(interaction);
    }
}
export const options = {
    devOnly: devMode,
    userPermissions: ["ManageRoles"],
    botPermissions: ["SendMessages", "EmbedLinks", "ManageRoles"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};
