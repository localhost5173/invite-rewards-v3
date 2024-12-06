import mongoose, { Schema } from "mongoose";
// Schema Definition
const SmartLeaderboardSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    leaderboardType: {
        type: String,
        required: true,
        enum: ["daily", "weekly", "monthly", "alltime"],
    },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
});
const SmartLeaderboardModel = mongoose.model("SmartLeaderboards", SmartLeaderboardSchema);
export default SmartLeaderboardModel;
