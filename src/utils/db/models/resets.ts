import mongoose, { Schema, Document } from "mongoose";

export interface ResetsDocument extends Document {
  resetType: "daily" | "weekly" | "monthly";
  lastReset: Date;
}

const ResetsShema = new Schema({
  resetType: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly"],
  },
  lastReset: { type: Date, default: Date.now },
});

export const ResetsModel = mongoose.model<ResetsDocument>(
  "resets",
  ResetsShema
);
