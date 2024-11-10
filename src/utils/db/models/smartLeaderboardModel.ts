import mongoose, { Schema, Document } from "mongoose";

interface SmartLeaderboardDocument extends Document {
  guildId: string;
  leaderboardType: "daily" | "weekly" | "monthly" | "alltime";
  channelId: string;
  messageId: string;
}

// Schema Definition
const SmartLeaderboardSchema: Schema = new Schema({
  guildId: { type: String, required: true, index: true },
  leaderboardType: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly", "alltime"],
  },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
});

const SmartLeaderboardModel = mongoose.model<SmartLeaderboardDocument>(
  "SmartLeaderboards",
  SmartLeaderboardSchema
);

export default SmartLeaderboardModel;
