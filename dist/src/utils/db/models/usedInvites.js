import mongoose, { Schema } from 'mongoose';
// Create the schema
const UsedInviteSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    code: { type: String, required: true, index: true },
    inviterId: { type: String, required: true },
    usedBy: { type: [String], default: [] },
});
// Create the model
const UsedInviteModel = mongoose.model('usedInvites', UsedInviteSchema);
export default UsedInviteModel;
