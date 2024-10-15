import { db } from "./init.js";

export async function addAutoRole(guildId: string, roleId: string) {
  const docRef = db.collection("auto-roles").doc(guildId);
  const doc = await docRef.get();

  if (!doc.exists) {
    // If the document does not exist, create it with the roleId in a new array
    await docRef.set({ autoRoles: [roleId] });
  } else {
    // If the document exists, update the existing array
    const guildData = doc.data();

    if (!guildData) {
      throw new Error("Guild data not found");
    }

    const autoRoles = guildData.autoRoles || [];

    if (autoRoles.includes(roleId)) return;

    autoRoles.push(roleId);

    await docRef.update({ autoRoles });
  }
}

export async function removeAutoRole(guildId: string, roleId: string) {
  const docRef = db.collection("auto-roles").doc(guildId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("No auto roles found for this guild");
  }

  const guildData = doc.data();

  if (!guildData) {
    throw new Error("Guild data not found");
  }

  const autoRoles = guildData.autoRoles || [];

  if (!autoRoles.includes(roleId)) return;

  const newAutoRoles = autoRoles.filter((id: string) => id !== roleId);

  await docRef.update({ autoRoles: newAutoRoles });
}

export async function getAutoRoles(guildId: string) {
  const docRef = db.collection("auto-roles").doc(guildId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return [];
  }

  const guildData = doc.data();

  if (!guildData) {
    throw new Error("Guild data not found");
  }

  return guildData.autoRoles || [];
}