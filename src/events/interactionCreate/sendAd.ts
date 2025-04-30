import { EmbedBuilder, Interaction } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import botConfig from "../../../config.json" with { type: "json" };

export default async function (interaction: Interaction) {
  if (!interaction.isCommand()) return;
  if (!interaction.isChatInputCommand()) return;

  try {
    const userId = interaction.user.id;

    const totalCommandUses = await db.usage.getTotalUserCommands(userId);

    console.log("total uses for " + userId + ":" + totalCommandUses);

    if (totalCommandUses == 1 || (totalCommandUses % 5 == 0 && totalCommandUses != 0)) {
      console.log("sending ad to " + userId);
      const embed = new EmbedBuilder()
      .setColor(0xFFD700) // Gold
      .setTitle("⚠️ Invite Rewards Might Shut Down ⚠️")
      .setDescription(
        "Hey 👋\n\n" +
        "I've just added a small donation goal of **$17.50** to help keep **Invite Rewards** running. If we don't reach it by **May 21st, 2025**, I’ll sadly have to **shut the bot down**.\n\n" +
        "This isn’t something I want to do, but there are a few costs involved in keeping everything online. If you’ve enjoyed using the bot or just want to help out, any support is hugely appreciated.\n\n" +
        "💖 [Click here to donate](https://buymeacoffee.com/localhost5173)\n\n" +
        "Thanks so much for being part of the community!"
      )
      .setFooter({
        text: "Let's keep Invite Rewards alive together! 💕",
      })
      .setThumbnail(botConfig.bot.logo);

      await interaction.user.send({ embeds: [embed] });

      db.ads.incrementAdsSent(userId);
    }
  } catch (error: unknown) {
    cs.error("Error in interactionCreate/sendAd.ts: " + error);
  }
}