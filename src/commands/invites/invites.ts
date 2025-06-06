import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { db } from "../../utils/db/db.js";
import { devMode } from "../../bot.js";
import { Embeds } from "../../utils/embeds/embeds.js";
import { Helpers } from "../../utils/helpers/helpers.js";
import { UsageCommands } from "../../utils/db/models/usageModel.js";

export const data: CommandData = {
  name: "invites",
  description: "View the invites of a user",
  options: [
    {
      name: "user",
      description: "The user to view the invites of",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: "breakdown",
      description: "View the breakdown of the invites",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const breakdown = interaction.options.getBoolean("breakdown") ?? false;
    const guildId = interaction.guildId!;

    // Only allow users with Manage Guild permission to view the invites of other users
    const permissions = interaction.member?.permissions as PermissionsBitField;
    console.log("permissions", permissions);
    if (
      (user !== interaction.user || breakdown) &&
      (!permissions || !permissions.has(PermissionFlagsBits.ManageGuild))
    ) {
      await interaction.reply({
        embeds: [
            await Embeds.createEmbed(
                guildId,
                "invites.noPermissions"
            ),
        ],
      });
      return;
    }

    const invites = await db.invites.userInvites.getInvites(guildId, user.id);

    const real = invites?.real ?? 0;
    const bonus = invites?.bonus ?? 0;
    const fake = invites?.fake ?? 0;
    const unverified = invites?.unverified ?? 0;

    db.usage.incrementUses(guildId, UsageCommands.InviteCountView);

    if (breakdown) {
      const embed = await Embeds.createEmbed(guildId, "invites.breakdown", {
        user: user.tag,
        real: real.toString(),
        bonus: bonus.toString(),
        fake: fake.toString(),
        unverified: unverified.toString(),
      });
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const totalInvites = real + bonus;
      const embed = await Embeds.createEmbed(guildId, "invites.total", {
        user: user.tag,
        totalInvites: totalInvites.toString(),
      });
      await interaction.reply({ embeds: [embed] });
    }
  } catch (error: unknown) {
    console.error("Error while getting invites: " + error);
    await Helpers.trySendCommandError(interaction);
  }
}

export const options: CommandOptions = {
  devOnly: devMode,
  userPermissions: ["SendMessages"],
  botPermissions: ["SendMessages", "EmbedLinks"],
  deleted: false,
  onlyGuild: true,
  voteLocked: true,
};
