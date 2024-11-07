import mongoose, { Schema, Document } from "mongoose";

// Define the structure of the Language document
interface LeaderboardUserDocument extends Document {
  guildId: string;
  userId: string;
  rank: number;
  invites: number;
}

// Create the schema
const LeaderboardUserSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, unique: true, index: true },
  rank: { type: Number, required: true, default: 0 },
  invites: { type: Number, required: true, default: 0 },
});

// Create the model
const LeaderboardUserModel = mongoose.model<LeaderboardUserDocument>(
  "leaderboards",
  LeaderboardUserSchema
);

export default LeaderboardUserModel;