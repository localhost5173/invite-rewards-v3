import { FieldValue } from "firebase-admin/firestore";
import { client } from "../index.js";
import { db } from "./init.js";

export async function getLeaderboardByType(
  guildId: string,
  type: "daily" | "weekly" | "monthly" | "allTime"
): Promise<any[]> {
  const doc = await db
    .collection(type + "-leaderboards")
    .doc(guildId)
    .get();

  if (!doc.exists) {
    return [];
  }

  if (!doc.data()) {
    return [];
  }

  return doc.data()?.leaderboard || [];
}

export async function updateLeaderboard(
  guildId: string,
  type: "daily" | "weekly" | "monthly" | "allTime",
  data: any
): Promise<void> {
  if (!data) {
    await db
      .collection(type + "-leaderboards")
      .doc(guildId)
      .set({ leaderboard: [] });
    return;
  }

  const cleanData = JSON.parse(JSON.stringify(data));
  await db
    .collection(type + "-leaderboards")
    .doc(guildId)
    .set({ leaderboard: cleanData });
}

export async function clearLeaderboard(
  guildId: string,
  type: "daily" | "weekly" | "monthly" | "allTime"
) {
  await db
    .collection(type + "-leaderboards")
    .doc(guildId)
    .delete();
}

export async function addToBlacklist(
  guildId: string,
  id: string,
  type: "user" | "role"
) {
  await db
    .collection("blacklist")
    .doc(guildId)
    .set(
      {
        [type]: FieldValue.arrayUnion(id),
      },
      { merge: true }
    );
}

export async function isBlacklisted(
  guildId: string,
  userId: string
): Promise<boolean> {
  const guild = client.guilds.cache.get(guildId);

  // Fetch the blacklist document for the guild
  const doc = await db.collection("blacklist").doc(guildId).get();
  if (!doc.exists) {
    return false; // No blacklist document means no one is blacklisted
  }

  if (!guild) {
    return false; // If the guild is not found, no one is blacklisted
  }

  const data = doc.data();
  if (!data) {
    return false;
  }

  // Check if the user is blacklisted
  if (data.user && data.user.includes(userId)) {
    return true;
  }

  // Get the member from the guild
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) {
    return false; // If the member is not found, they are not blacklisted
  }

  // Check if any of the user's roles are blacklisted
  const roles = member.roles.cache;
  for (const role of roles.values()) {
    if (data.roles && data.roles.includes(role.id)) {
      return true;
    }
  }

  return false;
}

export async function getBlacklist(guildId: string): Promise<any> {
  const doc = await db.collection("blacklist").doc(guildId).get();
  return doc.data() || [];
}

export async function removeFromBlacklist(
  guildId: string,
  id: string,
  type: "user" | "role"
) {
  await db
    .collection("blacklist")
    .doc(guildId)
    .set(
      {
        [type]: FieldValue.arrayRemove(id),
      },
      { merge: true }
    );
}

export async function createSmartLeaderboard(
    guildId: string,
    channelId: string,
    messageId: string,
    leaderboardType: "daily" | "weekly" | "monthly" | "allTime"
  ) {
    const newLeaderboard = {
      channelId,
      messageId,
      leaderboardType,
    };
  
    const docRef = db.collection("smart-leaderboards").doc(guildId);
  
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        // If the document does not exist, create it with the new leaderboard
        transaction.set(docRef, { leaderboards: [newLeaderboard] });
      } else {
        // If the document exists, update the array of leaderboards
        const data = doc.data();
        const leaderboards = data?.leaderboards || [];
        leaderboards.push(newLeaderboard);
        transaction.update(docRef, { leaderboards });
      }
    });
  }

export async function getSmartLeaderboards(guildId: string) {
  const doc = await db.collection("smart-leaderboards").doc(guildId).get();
  return doc.data()?.leaderboards || [];
}

export async function removeSmartLeaderboard(
  guildId: string,
  messageId: string
) {
  const docRef = db.collection("smart-leaderboards").doc(guildId);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      return;
    }

    const data = doc.data();
    const leaderboards = data?.leaderboards || [];

    const newLeaderboards = leaderboards.filter(
      (entry: any) => entry.messageId !== messageId
    );

    transaction.update(docRef, { leaderboards: newLeaderboards });
  });
}

export async function isSmartLeaderboardMessage(
  guildId: string,
  messageId: string
): Promise<boolean> {
  const doc = await db.collection("smart-leaderboards").doc(guildId).get();
  if (!doc.exists) {
    return false;
  }

  const data = doc.data();
  if (!data) {
    return false;
  }

  const leaderboards = data?.leaderboards || [];
  return leaderboards.some((entry: any) => entry.messageId === messageId);
}

export async function isSmartLeaderboardChannel(
  guildId: string,
  channelId: string
): Promise<boolean> {
  const doc = await db.collection("smart-leaderboards").doc(guildId).get();
  if (!doc.exists) {
    return false;
  }

  const data = doc.data();
  if (!data) {
    return false;
  }

  const leaderboards = data?.leaderboards || [];
  return leaderboards.some((entry: any) => entry.channelId === channelId);
}