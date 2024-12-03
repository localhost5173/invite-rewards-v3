import mongoose, { Schema } from "mongoose";
const ResetsShema = new Schema({
    resetType: {
        type: String,
        required: true,
        enum: ["daily", "weekly", "monthly"],
    },
    lastReset: { type: Date, default: Date.now },
});
export const ResetsModel = mongoose.model("resets", ResetsShema);
