import { EmbedBuilder, PartialGroupDMChannel, TextBasedChannel } from "discord.js";
import { db } from "./init.js";
import { client } from "../index.js";

export async function setWelcomeChannel(
  guildId: string,
  channelId: string,
  message: string
): Promise<void> {
  const doc = db.collection("welcome-channels").doc(guildId);
  await doc.set(
    {
      channelId: channelId,
      message: message,
    },
    { merge: true }
  );
}

export async function setGoodbyeChannel(
  guildId: string,
  channelId: string,
  message: string
): Promise<void> {
  const doc = db.collection("leave-channels").doc(guildId);
  await doc.set(
    {
      channelId: channelId,
      message: message,
    },
    { merge: true }
  );
  ("");
}

export async function getLeaveChannelData(guildId: string) {
  const doc = await db.collection("leave-channels").doc(guildId).get();
  return doc.data();
}

export async function getWelcomeChannelData(guildId: string) {
  const doc = await db.collection("welcome-channels").doc(guildId).get();
  return doc.data();
}

export async function setEmbedAsWelcomeOrLeaveMessage(
  guildId: string,
  embed: EmbedBuilder,
  type: "welcome" | "leave"
): Promise<void> {
  const jsonEmbed = embed.toJSON();
  if (type === "welcome") {
    await db.collection("welcome-channels").doc(guildId).set(
      {
        embed: jsonEmbed,
      },
      { merge: true }
    );
  } else {
    await db.collection("leave-channels").doc(guildId).set(
      {
        embed: jsonEmbed,
      },
      { merge: true }
    );
  }
}

export async function removeWelcomeChannel(guildId: string): Promise<void> {
    const docRef = db.collection("welcome-channels").doc(guildId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error(`Document for guildId ${guildId} does not exist.`);
      return;
    }

    await docRef.update({
      channelId: "",
    });
}

export async function removeLeaveChannel(guildId: string): Promise<void> {
    const docRef = db.collection("leave-channels").doc(guildId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error(`Document for guildId ${guildId} does not exist.`);
      return;
    }

    await docRef.update({
      channelId: "",
    });
}

export async function setInfoChannel(
  guildId: string,
  channelId: string
): Promise<void> {
  const doc = db.collection("info-channels").doc(guildId);
  await doc.set(
    {
      channelId: channelId,
    },
    { merge: true }
  );
}

export async function getInfoChannel(guildId: string) {
  const doc = await db.collection("info-channels").doc(guildId).get();
  return doc.data();
}

export async function sendMessageToInfoChannel(
  guildId: string,
  message: string
) {

  const data = await getInfoChannel(guildId);
  if (!data) return;

  const channelId = data.channelId;
  if (!channelId) return;

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channelObj = guild.channels.cache.get(channelId) as TextBasedChannel;
  if (!channelObj) return;

  if (channelObj instanceof PartialGroupDMChannel) {
    return;
  }

  channelObj.send(message);
}

export async function sendEmbedToInfoChannel(
  guildId: string,
  embed: EmbedBuilder
) {
  const data = await getInfoChannel(guildId);
  if (!data) return;

  const channelId = data.channelId;
  if (!channelId) return;

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channelObj = guild.channels.cache.get(channelId) as TextBasedChannel;
  if (!channelObj) return;

  if (channelObj instanceof PartialGroupDMChannel) {
    return;
  }

  channelObj.send({ embeds: [embed] });
}

export async function removeInfoChannel(guildId: string): Promise<void> {
  await db.collection("info-channels").doc(guildId).update({
    channelId: "",
  });
}

export async function setVerificationChannel(
  guildId: string,
  channelId: string
): Promise<void> {
  const doc = db.collection("verification-channels").doc(guildId);
  await doc.set(
    {
      channelId: channelId,
    },
    { merge: true }
  );
}

export async function isVerificationChannelSet(guildId: string): Promise<boolean> {
  const doc = await db.collection("verification").doc(guildId).get();
  return doc.exists;
}

export async function getVerificationChannel(guildId: string) : Promise<any> {
  const doc = await db.collection("verification-channels").doc(guildId).get();

  if (!doc.exists) return null;

  return doc.data()?.channelId;
}

export async function removeVerificationChannel(guildId: string): Promise<void> {
  await db.collection("verification-channels").doc(guildId).update({
    channelId: "",
  });
}