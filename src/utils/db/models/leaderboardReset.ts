import mongoose, { Schema, Document } from "mongoose";

interface LeaderboardResetDocument extends Document {
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime";
  lastReset: Date;
}

// Define the schema
const LeaderboardResetSchema = new Schema({
  leaderboardType: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly", "alltime"],
  },
  lastReset: { type: Date, required: true, default: Date.now },
});

// Create the model
const LeaderboardResetModel = mongoose.model<LeaderboardResetDocument>(
  "leaderboardReset",
  LeaderboardResetSchema
);

export default LeaderboardResetModel;
