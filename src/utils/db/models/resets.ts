import mongoose, { Schema, Document } from "mongoose";

export interface ResetsDocument extends Document {
    resetType: "reactionRoles",
    lastReset: Date,
}

const ResetsShema = new Schema({
    resetType: { type: String, required: true, enum: ["reactionRoles"] },
    lastReset: { type: Date, default: Date.now },
});

export const ResetsModel = mongoose.model<ResetsDocument>(
  "resets",
  ResetsShema
);