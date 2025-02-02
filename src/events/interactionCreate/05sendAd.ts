import { EmbedBuilder, Interaction } from "discord.js";
import { db } from "../../utils/db/db.js";
import { cs } from "../../utils/console/customConsole.js";
import botConfig from "../../../config.json" assert { type: "json" };

export default async function (interaction: Interaction) {
  if (!interaction.isCommand()) return;
  if (!interaction.isChatInputCommand()) return;

  try {
    const userId = interaction.user.id;

    const totalCommandUses = await db.usage.getTotalUserCommands(userId);

    console.log("total uses for " + userId + ":" + totalCommandUses);

    if (totalCommandUses == 2 || (totalCommandUses % 5 == 0 && totalCommandUses != 0)) {
      console.log("sending ad to " + userId);
      const embed = new EmbedBuilder()
        .setColor(0xFFD700) // Gold
        .setTitle("🌟 Thank You for Using Invite Rewards! 🌟")
        .setDescription(
          "Your support means the world to me! Maintaining and hosting **Invite Rewards** takes time and resources, and your feedback helps make it better every day.\n\n" +
          "**Here’s how you can support development:**\n" +
          "1️⃣ **Consider supporting the project directly!**\n" +
          "[Click here to support me!](https://buymeacoffee.com/localhost5173) 💖 Every contribution helps keep the bot running and improving for everyone.\n\n" +
          "2️⃣ **Try out my [Chrome Extension](https://chromewebstore.google.com/detail/youtube-shortener/koajbjhejaiiahbfpbigibbmgodglagd?hl=en-US&utm_source=ext_sidebar)!**\n" +
          "Using it and sharing feedback directly helps me improve both the bot and the extension.\n\n" +
          "Every bit of support, whether it’s donations or feedback, helps make **Invite Rewards** even better! 🚀"
        )
        .setFooter({
          text: "Thanks for being a part of Invite Rewards! 💕",
        })
        .setThumbnail(botConfig.bot.logo);

      await interaction.user.send({ embeds: [embed] });

      db.ads.incrementAdsSent(userId);
    }
  } catch (error: unknown) {
    cs.error("Error in interactionCreate/sendAd.ts: " + error);
  }
}