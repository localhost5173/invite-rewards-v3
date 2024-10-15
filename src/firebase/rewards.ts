import { db } from "./init.js";

type InviteReward = {
  type: "role" | "link" | "link-bank";
  removable?: boolean;
  role?: string;
  link?: string;
  linkBank?: string;
};

export async function createInviteReward(
  guildId: string,
  count: number,
  reward: InviteReward
): Promise<void> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  data[count] = reward;

  await doc.set(data);
}

export async function getGuildRewards(guildId: string): Promise<any> {
  const doc = await db.collection("rewards").doc(guildId).get();
  return doc.data();
}

export async function removeLinkFromBank(
  guildId: string,
  count: number,
  link: string
): Promise<void> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  if (data[count].type === "link-bank") {
    data[count].bank = data[count].bank.filter((l: string) => l !== link);
  }

  await doc.set(data);
}

export async function removeReward(
  guildId: string,
  count: number
): Promise<void> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  delete data[count];

  await doc.set(data);
}

export async function fillBankById(
  guildId: string,
  invites: number,
  links: string[]
): Promise<boolean> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  if (data[invites].type === "link-bank") {
    data[invites].bank = links;
    await doc.set(data);
    return true;
  } else {
    return false;
  }
}

export async function updateUsedBy(
  guildId: string,
  count: number,
  userId: string
): Promise<void> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  if (data[count].usedBy) {
    data[count].usedBy.push(userId);
  } else {
    data[count].usedBy = [userId];
  }

  await doc.set(data);
}

export async function hasBeenUsedBy(
  guildId: string,
  count: number,
  userId: string
): Promise<boolean> {
  const doc = db.collection("rewards").doc(guildId);
  const data = (await doc.get()).data() || {};

  if (!data[count].usedBy) {
    return false;
  }

  return data[count].usedBy.includes(userId) || false;
}