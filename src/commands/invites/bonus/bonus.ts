import type {
    CommandData,
    CommandOptions,
    SlashCommandProps,
} from "commandkit";
import {
    ApplicationCommandType,
    ApplicationCommandOptionType,
} from "discord.js";
import { devMode } from "../../../index.js";
import addFakeInvites from "./add.js";
import removeFakeInvites from "./remove.js";

export const data: CommandData = {
    name: "bonus-invites",
    description: "Manage Fake Invites",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "add",
            description: "Add fake invites to a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "count",
                    description: "The amount of invites to add",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
        {
            name: "remove",
            description: "Remove fake invites from a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user",
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: "count",
                    description: "The amount of invites to remove",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        },
    ],
};

export async function run({ interaction }: SlashCommandProps) {
    const subcommand = interaction.options.getSubcommand(false);

    switch (subcommand) {
        case "add":
            await addFakeInvites(interaction);
            break;
        case "remove":
            await removeFakeInvites(interaction);
            break;
        default:
            await interaction.reply({
                content: "Invalid subcommand",
                ephemeral: true,
            });
    }
}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
};
