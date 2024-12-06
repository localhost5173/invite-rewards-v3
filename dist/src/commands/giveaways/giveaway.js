import { ApplicationCommandType, ApplicationCommandOptionType, } from "discord.js";
import giveawayCreate from "./giveaway-create.js";
import { devMode } from "../../index.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { cs } from "../../utils/console/customConsole.js";
import giveawayDelete from "./giveaway-delete.js";
import giveawayReroll from "./giveaway-reroll.js";
import giveawayEnd from "./giveaway-end.js";
import giveawayList from "./giveaway-list.js";
export const data = {
    name: "giveaway",
    description: "Manage giveaways",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "create",
            description: "Create a new giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "duration",
                    description: "The duration of the giveaway (e.g., 1h, 1d, 1w)",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "prize",
                    description: "The prize for the giveaway",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "description",
                    description: "The description of the giveaway",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "winners",
                    description: "Number of winners",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
                {
                    name: "reward-role",
                    description: "Role to give to the winners",
                    type: ApplicationCommandOptionType.Role,
                    required: false,
                },
                {
                    name: "invite-requirement",
                    description: "Invite requirement for the giveaway",
                    type: ApplicationCommandOptionType.Integer,
                    required: false,
                },
            ],
        },
        {
            name: "end",
            description: "End an existing giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "The ID of the giveaway to end",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "delete",
            description: "Delete an existing giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "The ID of the giveaway to delete",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: "list",
            description: "List all giveaways",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "reroll",
            description: "Reroll a giveaway",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "id",
                    description: "The ID of the giveaway to reroll",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
    ],
};
export async function run({ interaction }) {
    const subcommand = interaction.options.getSubcommand();
    try {
        switch (subcommand) {
            case "create":
                giveawayCreate(interaction);
                break;
            case "end":
                giveawayEnd(interaction);
                break;
            case "delete":
                giveawayDelete(interaction);
                break;
            case "list":
                giveawayList(interaction);
                break;
            case "reroll":
                giveawayReroll(interaction);
                break;
        }
    }
    catch (error) {
        cs.error("Error in giveaway command:" + error);
        await Helpers.trySendCommandError(interaction);
    }
}
export const options = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: [
        "ManageRoles",
        "ManageMessages",
        "EmbedLinks",
        "SendMessages",
        "AddReactions",
        "ViewChannel",
    ],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};
