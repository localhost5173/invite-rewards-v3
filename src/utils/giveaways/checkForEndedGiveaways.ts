import { ChannelType } from "discord.js";
import { getEndedGiveaways } from "../../firebase/giveaways.js";
import { client } from "../../index.js";
import { endGiveaway } from "./endGiveaway.js";

export default async function () {
  try {
    const giveaways = await getEndedGiveaways();

    giveaways.forEach(async (giveaway) => {
      const guild = client.guilds.cache.get(giveaway.guildId);
      if (guild) {
        await endGiveaway(guild, giveaway);
      }
    });
  } catch (error: any) {
    console.error(error);
  }
}