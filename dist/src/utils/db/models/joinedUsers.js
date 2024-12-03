import mongoose, { Schema } from "mongoose";
// Create the schema
const JoinedUserSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    inviterId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    isVerified: { type: Boolean, required: true, default: true },
    isFake: { type: Boolean, required: true, default: false },
    history: [
        {
            joinedAt: { type: Date, required: true },
            leftAt: { type: Date, default: null }, // Default to null when user hasn't left
        },
    ],
});
// Create the model
const JoinedUserModel = mongoose.model("joinedUsers", JoinedUserSchema);
export default JoinedUserModel;
