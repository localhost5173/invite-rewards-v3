import { Client, EmbedBuilder, Guild } from "discord.js";
import { addBotEmbed, noPermissionsEmbed } from "./embeds/system.js";
import { InviteDataEntry, updateInviteData } from "../firebase/invites.js";
import { sendMessageToInfoChannel } from "../firebase/channels.js";

export default async function (client: Client, guild: Guild) {
  try {
    const invites = await guild.invites.fetch();

    // Create a plain JSON object to store invite data by invite code
    const inviteData: { [inviteCode: string]: InviteDataEntry } = {};

    invites.forEach((invite) => {
      inviteData[invite.code] = {
        code: invite.code,
        expiresAt: invite.expiresAt,
        inviterId: invite.inviter ? invite.inviter.id : null,
        maxUses: invite.maxUses,
        uses: invite.uses ?? 0,
      };
    });

    // Store the invite data object in Firestore
    const helloEmbed = addBotEmbed();
    await dmOwner(guild, helloEmbed);
    await updateInviteData(guild.id, inviteData);
  } catch (error: any) {
    if (error.code === 50013) {
      console.error(
        `Missing permissions for guild ${guild.name}. Ensure the bot has the necessary permissions.`
      );
      await sendMessageToInfoChannel(
        guild.id,
        `Missing permissions, cannot fetch guild invites. Grant the Invite Rewards role the manage guild permission or ask for help in the support server (use \`/invite\`).`
      );
      const errorEmbed = noPermissionsEmbed();
      await dmOwner(guild, errorEmbed);
    } else {
      console.error(`Failed to fetch invites for guild ${guild.name}:`, error);
    }
  }
}

async function dmOwner(guild: Guild, embed: EmbedBuilder) {
  const owner = await guild.fetchOwner();
  const ownerDM = await owner.createDM();

  ownerDM.send({ embeds: [embed] });
}
