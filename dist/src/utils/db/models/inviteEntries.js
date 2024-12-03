import mongoose, { Schema } from 'mongoose';
// Create the schema
const InviteEntrySchema = new Schema({
    guildId: { type: String, required: true, index: true },
    code: { type: String, required: true, index: true },
    expiresAt: { type: Date, default: null },
    inviterId: { type: String, default: undefined },
    maxUses: { type: Number, default: null },
    uses: { type: Number, default: null },
});
// Create the model
const InviteEntryModel = mongoose.model('InviteEntries', InviteEntrySchema);
export default InviteEntryModel;
