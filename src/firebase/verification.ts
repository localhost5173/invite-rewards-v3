import { db } from "./init.js";

export async function isVerificationOn(guildId: string): Promise<boolean> {
  const doc = await db.collection("verification").doc(guildId).get();
  return doc.exists;
}

export async function removeVerification(guildId: string): Promise<void> {
  await db.collection("verification").doc(guildId).delete();
}

export async function setVerificationRole(
  guildId: string,
  roleId: string
): Promise<void> {
  const doc = db.collection("verification").doc(guildId);
  await doc.set(
    {
      roleId: roleId,
    },
  );
}

export async function getVerificationRole(
  guildId: string
): Promise<string | undefined> {
  const doc = await db.collection("verification").doc(guildId).get();
  return doc.data()?.roleId;
}

export async function setVerificationQuestion(
  guildId: string,
  role: string,
  question: string,
  answer: string,
): Promise<void> {
  const doc = db.collection("verification").doc(guildId);
  await doc.set(
    {
      question: question,
      answer: answer,
      role: role,
    },
  );
}

export async function getVerificationQuestion(
  guildId: string,
): Promise<any> {
  const doc = await db.collection("verification").doc(guildId).get();
  return doc.data();
}