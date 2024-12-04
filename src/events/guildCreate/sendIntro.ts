import { Guild } from "discord.js";
import { cs } from "../../utils/console/customConsole.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import botconfig from "../../../config.json" assert { type: "json" };

export default async function (guild: Guild) {
    try {
        const channel = guild.systemChannel;
        const guildOwner = await guild.fetchOwner();

        const embed = await Embeds.createEmbed(null, "introEmbed", {
            botLogo: botconfig.bot.logo,
            website: botconfig.bot.website,
            supportServer: botconfig.bot.server,
            inviteLink: botconfig.bot.inviteLink,
            guide: botconfig.bot.guide,
        });

        if (guildOwner) {
            await guildOwner.send({ embeds: [embed] });
        }

        if (channel) {
            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        cs.error("Error while sending intro: " + error);
    }
}