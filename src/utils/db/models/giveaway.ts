import mongoose, { Schema, Document } from "mongoose";
import CounterModel from "./giveawayCounters"; // Adjust the import path as needed

export interface GiveawayDocument extends Document {
  // Essential identifiers
  guildId: string;
  giveawayId: number;
  messageId: string;
  channelId: string;

  // Giveaway details
  prize: string;
  description: string;
  hostId: string;
  endTime: Date;
  numberOfWinners: number;

  // Status flags
  ended: boolean;
  scheduledToEnd: boolean;

  // Optional requirements and rewards
  inviteRequirement?: number;
  rewardRoleId?: string;

  // Participants and winners
  entries: string[];
  winners: string[];
}

// Create the schema
const GiveawaySchema: Schema = new Schema({
  // Essential identifiers
  guildId: { type: String, required: true },
  giveawayId: { type: Number, required: false },
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },

  // Giveaway details
  prize: { type: String, required: true },
  description: { type: String, required: true },
  hostId: { type: String, required: true },
  endTime: { type: Date, required: true },
  numberOfWinners: { type: Number, required: true },

  // Status flags
  ended: { type: Boolean, required: true, default: false },
  scheduledToEnd: { type: Boolean, required: true, default: false },

  // Optional requirements and rewards
  inviteRequirement: { type: Number },
  rewardRoleId: { type: String },

  // Participants and winners
  entries: { type: [String], default: [] },
  winners: { type: [String], default: [] },
});

// Pre-save hook to auto-increment the giveawayId
GiveawaySchema.pre<GiveawayDocument>("save", async function (next) {
  if (this.isNew) {
    const counter = await CounterModel.findOneAndUpdate(
      { guildId: this.guildId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.giveawayId = counter.seq;
  }
  next();
});

// Create the model
const GiveawayModel = mongoose.model<GiveawayDocument>(
  "giveaways",
  GiveawaySchema
);

export default GiveawayModel;
