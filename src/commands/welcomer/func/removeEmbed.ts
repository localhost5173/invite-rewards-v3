import { ChatInputCommandInteraction } from "discord.js";

export default async function (
  interaction: ChatInputCommandInteraction,
  type: "welcome" | "farewell",
  location: "server" | "dm" | "vanity"
) {}