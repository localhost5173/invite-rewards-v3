import mongoose, { Schema } from "mongoose";
// Create the schema
const UserInvitesSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    real: { type: Number, default: 0 },
    fake: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    unverified: { type: Number, default: 0 },
    timed: {
        daily: {
            real: { type: Number, default: 0 },
            fake: { type: Number, default: 0 },
            bonus: { type: Number, default: 0 },
            unverified: { type: Number, default: 0 },
        },
        weekly: {
            real: { type: Number, default: 0 },
            fake: { type: Number, default: 0 },
            bonus: { type: Number, default: 0 },
            unverified: { type: Number, default: 0 },
        },
        monthly: {
            real: { type: Number, default: 0 },
            fake: { type: Number, default: 0 },
            bonus: { type: Number, default: 0 },
            unverified: { type: Number, default: 0 },
        },
    },
});
// Create the model
const UserInvitesModel = mongoose.model("userInvites", UserInvitesSchema);
export default UserInvitesModel;
