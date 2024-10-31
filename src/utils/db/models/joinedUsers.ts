import mongoose, { Schema, Document } from "mongoose";

// Define the structure of the document
export interface JoinedUserDocument extends Document {
  guildId: string;
  inviterId: string;
  userId: string;
  isVerified: boolean;
  history: {
    joinedAt: Date;
    leftAt: Date | null; // leftAt is null when the user hasn't left yet
  }[];
}

// Create the schema
const JoinedUserSchema: Schema = new Schema({
  guildId: { type: String, required: true, index: true },
  inviterId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  isVerified: { type: Boolean, required: true, default: true },
  history: [
    {
      joinedAt: { type: Date, required: true },
      leftAt: { type: Date, default: null }, // Default to null when user hasn't left
    },
  ],
});

// Create the model
const JoinedUserModel = mongoose.model<JoinedUserDocument>(
  "joinedUsers",
  JoinedUserSchema
);

export default JoinedUserModel;
