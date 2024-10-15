import type { Client, Guild } from "discord.js";
import type { CommandKit } from "commandkit";
import { InviteDataEntry, updateInviteData } from "../../firebase/invites.js";
import { sendMessageToInfoChannel } from "../../firebase/channels.js";
import { devMode } from "../../index.js";
import { noPermissionsEmbed } from "../../utils/embeds/system.js";

export default function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit
) {
  client.guilds.cache.forEach(async (guild) => {
    try {
      await getAndStoreInvites(guild);
    } catch (error: any) {
      if (error.code === 50013) {
        console.error(
          `Missing permissions for guild ${guild.name}. Ensure the bot has the necessary permissions.`
        );
        await sendMessageToInfoChannel(
          guild.id,
          `Missing permissions, cannot fetch guild invites. Move the Invite Rewards role higher up in the hierarchy or grant it administrator.`
        );
        // const owner = await guild.fetchOwner();
        // const ownerDM = await owner.createDM();

        // const embed = noPermissionsEmbed();
        // ownerDM.send({ embeds: [embed] });
      } else {
        console.error(
          `Failed to fetch invites for guild ${guild.name}:`,
          error
        );
      }
    }
  });
}

export async function getAndStoreInvites(guild: Guild) {
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
  await updateInviteData(guild.id, inviteData);
}