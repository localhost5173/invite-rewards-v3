import mongoose, { Schema } from "mongoose";
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
export const RewardModel = mongoose.model("Rewards", RewardSchema);
