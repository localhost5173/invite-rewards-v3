import { db } from "../firebase/init.js";
import { getTotalInvitesForUser } from "./invites.js";

export type GiveawayData = {
  endTime: Date;
  prize: string;
  winners: number;
  entries: string[];
  ended: boolean;
  giveawayId: number;
  hostId: string;
  description: string;
  rewardRoleId: string | null;
  inviteRequirement: number;
  messageId?: string;
  channelId?: string;
  winnerIds?: string[];
};

export async function createGiveaway(
  guildId: string,
  endTime: Date,
  prize: string,
  description: string,
  winners: number,
  hostId: string,
  inviteRequirement: number,
  rewardRoleId?: string
) {
  // Reference to the counter document
  const counterRef = db.collection("giveaway-counters").doc(guildId);

  // Run a transaction to safely update the counter
  let lastId = 0;
  await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    // Initialize the counter if it doesn't exist
    if (!counterDoc.exists) {
      // Set lastId to 0 if the document does not exist
      transaction.set(counterRef, { lastId });
    } else {
      // Directly access the data without extra checks
      const data = counterDoc.data();
      lastId = data?.lastId || 0; // Use lastId or default to 0 if undefined
    }

    // Increment lastId for the new giveaway
    transaction.update(counterRef, { lastId: lastId + 1 });

    // Create the giveaway with the new ID
    transaction.set(
      db
        .collection("giveaways")
        .doc(guildId)
        .collection("giveaways")
        .doc(lastId.toString()), // Ensure lastId is a string
      {
        endTime,
        prize,
        winners,
        entries: [],
        ended: false,
        giveawayId: lastId,
        hostId: hostId,
        description: description,
        rewardRoleId: rewardRoleId || null,
        inviteRequirement: inviteRequirement || 0,
      }
    );
  });

  // Return the new ID (which is lastId incremented above)
  return lastId;
}

export async function getGiveaway(guildId: string, giveawayId: string) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  const giveawayDoc = await giveawayRef.get();

  if (!giveawayDoc.exists) {
    throw new Error("Giveaway does not exist");
  }

  return giveawayDoc.data();
}

export async function getAllGiveaways(guildId: string) {
  const giveawaysRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways");

  const giveaways: any[] = [];

  // Query all giveaways
  const querySnapshot = await giveawaysRef.get();

  querySnapshot.forEach((doc) => {
    giveaways.push(doc.data());
  });

  return giveaways;
}

export async function addMessageChannelIds(
  guildId: string,
  giveawayId: string,
  messageId: string,
  channelId: string
) {
  await db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId)
    .update({
      messageId: messageId,
      channelId: channelId,
    });
}

export async function isEnteredGiveaway(
  guildId: string,
  giveawayId: string,
  userId: string
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  const giveawayDoc = await giveawayRef.get();

  if (!giveawayDoc.exists) {
    throw new Error("Giveaway does not exist");
  }

  const data = giveawayDoc.data();
  const entries = data?.entries || [];

  return entries.includes(userId);
}

export async function enterGiveaway(
  guildId: string,
  giveawayId: string,
  userId: string
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  // Run a transaction to safely update the giveaway
  await db.runTransaction(async (transaction) => {
    const giveawayDoc = await transaction.get(giveawayRef);

    // Check if the giveaway exists
    if (!giveawayDoc.exists) {
      throw new Error("Giveaway does not exist");
    }

    // Directly access the data without extra checks
    const data = giveawayDoc.data();
    const entries = data?.entries || [];

    // Check if the user has already entered the giveaway
    if (entries.includes(userId)) {
      throw new Error("You have already entered this giveaway");
    }

    // Add the user to the entries array
    transaction.update(giveawayRef, {
      entries: [...entries, userId],
    });
  });
}

export async function leaveGiveaway(
  guildId: string,
  giveawayId: string,
  userId: string
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  // Run a transaction to safely update the giveaway
  await db.runTransaction(async (transaction) => {
    const giveawayDoc = await transaction.get(giveawayRef);

    // Check if the giveaway exists
    if (!giveawayDoc.exists) {
      throw new Error("Giveaway does not exist");
    }

    // Directly access the data without extra checks
    const data = giveawayDoc.data();
    const entries = data?.entries || [];

    // Check if the user has entered the giveaway
    if (!entries.includes(userId)) {
      throw new Error("You have not entered this giveaway");
    }

    // Remove the user from the entries array
    transaction.update(giveawayRef, {
      entries: entries.filter((entry: any) => entry !== userId),
    });
  });
}

export async function getEndedGiveaways() {
  const now = new Date();
  const endedGiveaways: any[] = [];

  // Query all giveaways that have ended across all guilds
  const querySnapshot = await db
    .collectionGroup("giveaways")
    .where("endTime", "<=", now)
    .where("ended", "==", false)
    .get();

  querySnapshot.forEach((doc) => {
    endedGiveaways.push({ id: doc.id, guildId: doc.ref.parent.parent?.id, ...doc.data() });
  });

  return endedGiveaways;
}

export async function setAsEnded(guildId: string, giveawayId: string) {
  // Validate giveawayId
  if (!giveawayId || typeof giveawayId !== 'string' || giveawayId.trim() === '') {
    throw new Error(`Invalid giveawayId: ${giveawayId}`);
  }

  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId); // Ensure giveawayId is a string

  await giveawayRef.update({ ended: true });
}

export async function canUserEnterGiveaway(
  guildId: string,
  giveawayId: string,
  userId: string
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  const giveawayDoc = await giveawayRef.get();

  if (!giveawayDoc.exists) {
    throw new Error("Giveaway does not exist");
  }

  const data = giveawayDoc.data();
  const inviteRequirement = data?.inviteRequirement || 0;

  const ended = data?.ended || false;

  // Check if the user has the required invites
  const userInvites = await getTotalInvitesForUser(guildId, userId);
  if (userInvites >= inviteRequirement && !ended) {
    return true;
  } else {
    return false;
  }
}

export async function setEndDate(
  guildId: string,
  giveawayId: string,
  endTime: Date
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  await giveawayRef.update({ endTime });
}

export async function setWinners(
  guildId: string,
  giveawayId: string,
  winners: string[]
) {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  await giveawayRef.update({ winnerIds: winners });
}

export async function rerollGiveaway(guildId: string, giveawayId: string) : Promise<string[]> {
  const giveawayRef = db
    .collection("giveaways")
    .doc(guildId)
    .collection("giveaways")
    .doc(giveawayId);

  // Run a transaction to safely reroll the giveaway
  let newWinners: string[] = [];
  await db.runTransaction(async (transaction) => {
    const giveawayDoc = await transaction.get(giveawayRef);

    // Check if the giveaway exists
    if (!giveawayDoc.exists) {
      throw new Error("Giveaway does not exist");
    }

    // Directly access the data without extra checks
    const data = giveawayDoc.data();
    const entries = data?.entries || [];
    const winners = data?.winners || [];
    const numberOfWinners = data?.winners || 1;

    // Select new winners from the entries
    newWinners = entries
      .sort(() => Math.random() - 0.5)
      .slice(0, numberOfWinners);

    // Update the winners field
    transaction.update(giveawayRef, { winnerIds: newWinners });

    return newWinners;
  });

  return newWinners;
}