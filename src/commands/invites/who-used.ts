import type {
    CommandData,
    SlashCommandProps,
    CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";
import { devMode } from "../../index.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";

export const data: CommandData = {
    name: "who-used",
    description: "See all the joins from a specific invite link",
    options: [
        {
            name: "link",
            description: "The invite link to check",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
};

export async function run({ interaction }: SlashCommandProps) {
    try {
        const link = interaction.options.getString("link", true);
        const guildId = interaction.guildId!;

        await interaction.deferReply({ ephemeral: true });

        if (!link) {
            return interaction.followUp({ content: "Please provide a link or an invite code.", ephemeral: true });
        }

        const inviteCode = extractInviteCode(link);
        const inviteesList = await db.invites.usedInvites.getUsedByByCode(guildId, inviteCode);

        // Check if inviteesList is empty
        if (inviteesList.length === 0) {
            return interaction.followUp({ content: `No users have joined using the invite code \`${inviteCode}\`.`, ephemeral: true });
        } else {
            // Mention all invitees
            const inviteeMentionList = inviteesList.map(
                (invitee) => `<@!${invitee}>`
            );
            return interaction.followUp({
                content: `Users who joined using invite code \`${inviteCode}\`:\n${inviteeMentionList.join('\n')}`,
                ephemeral: true,
            });
        }
    } catch (error) {
        cs.error("Error while getting users who joined using the invite code: " + error);

        try {
            await interaction.followUp({
                content: "An error occurred while retrieving the invite link data.",
                ephemeral: true
            });
        } catch (error: unknown) {
            console.error(`Failed to send error message in who-used:`, error);

        }
    }
}

function extractInviteCode(link: string): string {
    const inviteCodePattern = /(?:https?:\/\/)?discord\.gg\/([a-zA-Z0-9]+)/;
    const match = link.match(inviteCodePattern);
    return match ? match[1] : link;
}


export const options: CommandOptions = {
    devOnly: devMode,
    userPermissions: ["ManageGuild"],
    botPermissions: ["SendMessages", "EmbedLinks"],
    deleted: false,
    onlyGuild: true,
    voteLocked: false,
};