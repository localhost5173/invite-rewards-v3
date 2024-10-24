import { ChatInputCommandInteraction } from "discord.js";
import { cs } from "../../../utils/console/customConsole";
import { db } from "../../../utils/db/db";

export default async function (interaction: ChatInputCommandInteraction) {
    try {
        const user = interaction.options.getUser("user", true);
        const count = interaction.options.getInteger("count", true);

        await interaction.deferReply({ ephemeral: true });

        await db.invites.userInvites.addBonus(interaction.guildId!, user.id, -count);

        await interaction.followUp({
            content: `Successfully removed ${count} bonus invites from ${user.tag}`,
        });
    } catch (error: unknown) {
        cs.error("Error while handling bonus-invites remove command: " + error);

        try {
            await interaction.followUp({
                content: "An error occurred while adding bonus invites to the user",
                ephemeral: true,
            });
        } catch (error: unknown) {
            cs.error("Error while sending an error message for bonus-invites add command: " + error);
        }
    }
}