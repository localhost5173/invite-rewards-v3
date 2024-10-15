import { Invite } from "discord.js";
import { addInviteEntry, InviteDataEntry } from "../../firebase/invites.js"; // Adjust the path as necessary

export default async function (invite: Invite) {
  try {
    if (!invite.guild) return;
    const guildId = invite.guild.id;

    // Create the invite entry
    const inviteEntry: InviteDataEntry = {
      code: invite.code,
      uses: invite.uses || 0,
      inviterId: invite.inviter?.id || null,
      maxUses: invite.maxUses || null,
      expiresAt: invite.expiresAt || null,
    };

    // Call the addInviteEntry function
    await addInviteEntry(guildId, inviteEntry);
  } catch (error) {
    console.error(
      `Failed to store invite ${invite.code}`,
      error
    );
  }
}
