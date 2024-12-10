import type {
    CommandData,
    SlashCommandProps,
    CommandOptions,
} from "commandkit";
import { Embeds } from "../../utils/embeds/embeds.js";
import { ApplicationCommandOptionType } from "discord.js";
import { db } from "../../utils/db/db.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { cs } from "../../utils/console/customConsole.js";
import { devMode } from "../../bot.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export const data: CommandData = {
    name: "smart-leaderboards",
    description: "Stop all current smart leaderboards from updating. This allows you to create new ones.",
    options: [
        {
            name: "delete-all",
            description: "Delete all smart leaderboards",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ]
};

export async function run({ interaction }: SlashCommandProps) {
    try {
        const guildId = interaction.guild!.id;

        await db.leaderboards.deleteAllSmartLeaderboards(guildId);

        await interaction.reply({
            embeds: [
                await Embeds.createEmbed(guildId, "leaderboards.smart.deleteAll"),
            ],
            ephemeral: true,
        });
        db.usage.incrementUses(guildId, UsageCommands.LeaderboardSmartDeleteAll);
    } catch (error) {
        cs.error("Error with deleting all smart leaderboards: " + error);

        await Helpers.trySendCommandError(interaction);
    }

}

export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};