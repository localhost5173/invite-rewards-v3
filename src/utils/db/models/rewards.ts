import mongoose, { Schema, Document } from "mongoose";

export interface RewardDocument extends Document {
  guildId: string;
  rewardName: string;
  inviteThreshold: number;
  rewardType: "role" | "message" | "messageStore";
  claimedBy: string[];
  removable?: boolean;
  roleId?: string;
  message?: string;
  messageStore?: string[];
}

const RewardSchema = new Schema({
  guildId: { type: String, required: true },
  rewardName: { type: String, required: true },
  inviteThreshold: { type: Number, required: true },
  rewardType: {
    type: String,
    required: true,
    enum: ["role", "message", "messageStore"],
  },
  claimedBy: { type: [String], default: [] },
  removable: { type: Boolean },
  roleId: { type: String },
  message: { type: String },
  messageStore: { type: [String] },
});

export const RewardModel = mongoose.model<RewardDocument>(
  "Rewards",
  RewardSchema
);
