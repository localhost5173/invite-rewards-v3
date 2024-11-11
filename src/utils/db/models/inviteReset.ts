import mongoose, { Schema, Document } from "mongoose";

interface InviteResetDocument extends Document {
  inviteType: "daily" | "weekly" | "monthly";
  lastReset: Date;
}

// Define the schema
const InviteResetSchema = new Schema({
  inviteType: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly"],
  },
  lastReset: { type: Date, required: true, default: Date.now },
});

// Create the model
const InviteResetModel = mongoose.model<InviteResetDocument>(
  "inviteReset",
  InviteResetSchema
);

export default InviteResetModel;
