import mongoose, { Schema, Document } from "mongoose";

interface LeaderboardUserDocument extends Document {
  guildId: string;
  userId: string;
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime";
  inviteCount: number;
}

// Schema Definition
const LeaderboardUserSchema: Schema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  leaderboardType: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly", "alltime"],
    index: true,
  },
  inviteCount: { type: Number, required: true, default: 0 },
});

// Compound unique index to avoid duplicate entries per user in each leaderboard
LeaderboardUserSchema.index({ guildId: 1, userId: 1, leaderboardType: 1 }, { unique: true });

const LeaderboardUserModel = mongoose.model<LeaderboardUserDocument>(
  "LeaderboardUsers",
  LeaderboardUserSchema
);

export default LeaderboardUserModel;
