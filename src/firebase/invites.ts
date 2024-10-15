import { Collection, Guild, GuildMember, PartialGuildMember } from "discord.js";
import { db } from "./init.js";
import { FieldValue } from "firebase-admin/firestore";
import { devMode } from "../index.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { QueryDocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";

export type InviteDataEntry = {
  code: string;
  inviterId: string | null;
  uses: number;
  maxUses: number | null;
  expiresAt: Date | null;
};

export async function updateInviteData(
  guildId: string,
  inviteData: { [inviteCode: string]: InviteDataEntry }
): Promise<void> {
  await db.collection("invite-data").doc(guildId).set(
    { invites: inviteData },
    { merge: true } // Use merge to update existing document without overwriting
  );
}

export async function getInviteData(
  guildId: string
): Promise<{ [inviteCode: string]: InviteDataEntry } | undefined> {
  const doc = await db.collection("invite-data").doc(guildId).get();
  return doc.data()?.invites;
}

export async function getTotalInvitesForUser(
  guildId: string,
  userId: string
): Promise<number> {
  const doc = await db
    .collection("user-invites")
    .doc(guildId)
    .collection("user")
    .doc(userId)
    .get();

  if (!doc.exists) {
    return 0; // Return null if no data exists
  }

  const data = doc.data();
  const real = data?.real || 0;
  const fake = data?.fake || 0;

  return real + fake;
}

export async function getSplitInvitesForUser(
  guildId: string,
  userId: string
): Promise<{ real: number; fake: number }> {
  const doc = await db
    .collection("user-invites")
    .doc(guildId)
    .collection("user")
    .doc(userId)
    .get();

  if (!doc.exists) {
    return { real: 0, fake: 0 }; // Return null if no data exists
  }

  const data = doc.data();
  const real = data?.real || 0;
  const fake = data?.fake || 0;

  return { real, fake };
}

export async function incrementRealInvites(
  guildId: string,
  userId: string
): Promise<void> {
  const doc = db
    .collection("user-invites")
    .doc(guildId)
    .collection("user")
    .doc(userId);

  await doc.set(
    {
      userId: userId,
      real: FieldValue.increment(1),
    },
    { merge: true }
  );
}

export async function decrementRealInvites(
  guildId: string,
  userId: string
): Promise<void> {
  const doc = db
    .collection("user-invites")
    .doc(guildId)
    .collection("user")
    .doc(userId);

  await doc.set(
    {
      userId: userId,
      real: FieldValue.increment(-1),
    },
    { merge: true }
  );
}

export async function saveInviteUsage(
  guildId: string,
  memberId: string,
  inviterId: string,
  inviteCode: string
): Promise<void> {
  const doc = await db
    .collection("used-invites")
    .doc(guildId)
    .collection("code")
    .doc(inviteCode)
    .get();

  if (!doc.exists) {
    await db
      .collection("used-invites")
      .doc(guildId)
      .collection("code")
      .doc(inviteCode)
      .set({
        inviteCode: inviteCode,
        inviterId: inviterId,
        usedBy: [memberId],
      });
  } else {
    // Update the usedBy array
    await db
      .collection("used-invites")
      .doc(guildId)
      .collection("code")
      .doc(inviteCode)
      .set(
        {
          usedBy: FieldValue.arrayUnion(memberId),
        },
        { merge: true }
      );
  }
}

export async function removeUserFromUsedInvites(
  guildId: string,
  userId: string
): Promise<void> {
  // Get all documents in the 'code' sub-collection of the specified guild
  const codesSnapshot = await db
    .collection("used-invites")
    .doc(guildId)
    .collection("code")
    .get();

  // Iterate through all documents in the 'code' sub-collection
  codesSnapshot.forEach(async (doc) => {
    const data = doc.data();

    // Check if 'usedBy' array exists and contains the 'userId'
    if (data?.usedBy && data.usedBy.includes(userId)) {
      // Remove 'userId' from the 'usedBy' array
      await db
        .collection("used-invites")
        .doc(guildId)
        .collection("code")
        .doc(doc.id)
        .update({
          usedBy: FieldValue.arrayRemove(userId),
        });
    }
  });
}

export async function getInviterForUser(
  guildId: string,
  userId: string
): Promise<string | null> {
  const doc = await db
    .collection("used-invites")
    .doc(guildId)
    .collection("code")
    .where("usedBy", "array-contains", userId)
    .limit(1)
    .get();

  if (doc.empty) {
    return null;
  }

  return doc.docs[0].data().inviterId;
}

export async function whoUsed(
  guildId: string,
  inviteLink: string
): Promise<string[]> {
  const doc = await db
    .collection("used-invites")
    .doc(guildId)
    .collection("code")
    .doc(inviteLink)
    .get();
  if (!doc.exists) {
    return [];
  }

  const data = doc.data();
  if (!data) {
    return [];
  }

  return data.usedBy || [];
}

export async function addFakeInvites(
  guildId: string,
  userId: string,
  amount: number
): Promise<void> {
  const doc = db
    .collection("user-invites")
    .doc(guildId)
    .collection("user")
    .doc(userId);

  await doc.set(
    {
      userId: userId,
      fake: FieldValue.increment(amount),
    },
    { merge: true }
  );
}

export async function getInvitedUsersByUser(
  guildId: string,
  userId: string
): Promise<string[]> {
  const doc = await db
    .collection("used-invites")
    .doc(guildId)
    .collection("code")
    .where("inviterId", "==", userId)
    .get();

  const users = new Set<string>();

  doc.forEach((invite) => {
    const data = invite.data();
    if (data.usedBy) {
      data.usedBy.forEach((user: string) => users.add(user));
    }
  });

  return Array.from(users);
}

export async function getUserInvites(guildId: string) {
  const snapshot = await db.collection("user-invites").doc(guildId).collection("user").get();
  
  // Check if the snapshot is empty
  if (snapshot.empty) {
    devMode ?? console.log('No matching documents.');
    return [];
  }

  // Map over the documents and extract the data
  const invites = snapshot.docs.map(doc => doc.data());
  
  devMode ?? console.log(invites);

  return invites;
}

export async function fetchActiveMembersForGuild(guild: Guild, sinceDate: Date): Promise<void> {
  try {
    const membersRef = db.collection(`members/${guild.id}/members`);
    const q = membersRef.where("joinedAt", ">", sinceDate).where("leftAt", "==", null);
    const querySnapshot: QuerySnapshot = await q.get();

    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      console.log(`Active member: ${doc.id} => ${JSON.stringify(doc.data())}`);
    });

    console.log(`Fetched active members for guild: ${guild.name}`);
  } catch (error) {
    console.error(`Failed to fetch active members for guild: ${guild.name}`, error);
  }
}

export async function updateMemberLeaveTimeInFirestore(member: GuildMember | PartialGuildMember): Promise<void> {
  const memberRef = db.collection("members").doc(member.guild.id).collection("members").doc(member.id);
  await memberRef.update({
    leftAt: FieldValue.serverTimestamp(),
  });
  console.log(`Member leave time updated in Firestore: ${member.user.tag}`);
}

export async function addMemberToFirestore(member: GuildMember): Promise<void> {
  const memberRef = db.collection("members").doc(member.guild.id).collection("members").doc(member.id);
  await memberRef.set({
    joinedAt: member.joinedAt,
    leftAt: null,
  });
  console.log(`Member added to Firestore: ${member.user.tag}`);
}

export async function addInviteEntry(
  guildId: string,
  invite: InviteDataEntry
): Promise<void> {
  try {
    // Fetch the existing invite data
    const existingInviteData = await getInviteData(guildId) || {};

    // Add the new invite entry
    existingInviteData[invite.code] = invite;

    // Update the invite data in the database
    await updateInviteData(guildId, existingInviteData);
    console.log(`Invite entry ${invite.code} added for guild ${guildId}`);
  } catch (error) {
    console.error(`Failed to add invite entry ${invite.code} for guild ${guildId}:`, error);
  }
}