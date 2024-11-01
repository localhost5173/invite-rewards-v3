import { EmbedBuilder, APIEmbed } from "discord.js";
import mongoose, { Schema, Document } from "mongoose";

interface WelcomerServer {
  welcomeChannelId: string | null;
  welcomeMessage: string | null;
  welcomeEmbed: APIEmbed | null;
  farewellChannelId: string | null;
  farewellMessage: string | null;
  farewellEmbed: APIEmbed | null;
}

interface WelcomerDM {
  welcomeMessage: string | null;
  welcomeEmbed: APIEmbed | null;
  farewellMessage: string | null;
  farewellEmbed: APIEmbed | null;
}

// Define the structure of the document
export interface WelcomerDocument extends Document {
  guildId: string;
  server: WelcomerServer;
  dm: WelcomerDM;
}

// Create the schema
const WelcomerSchema: Schema = new Schema({
  guildId: { type: String, required: true },
  server: {
    welcomeChannelId: { type: String, default: null },
    welcomeMessage: { type: String, default: null },
    welcomeEmbed: { type: Object, default: null },
    farewellChannelId: { type: String, default: null },
    farewellMessage: { type: String, default: null },
    farewellEmbed: { type: Object, default: null },
  },
  dm: {
    welcomeMessage: { type: String, default: null },
    welcomeEmbed: { type: Object, default: null },
    farewellMessage: { type: String, default: null },
    farewellEmbed: { type: Object, default: null },
  },
});

// Method to convert APIEmbed back to EmbedBuilder when fetching data
WelcomerSchema.methods.getWelcomeEmbed = function () {
  return this.welcomeEmbed ? new EmbedBuilder(this.welcomeEmbed) : null;
};

WelcomerSchema.methods.getFarewellEmbed = function () {
  return this.farewellEmbed ? new EmbedBuilder(this.farewellEmbed) : null;
};

// Create the model
const WelcomerModel = mongoose.model<WelcomerDocument>(
  "welcomer",
  WelcomerSchema
);

export default WelcomerModel;
