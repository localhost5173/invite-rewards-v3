import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the document
export interface UsedInviteDocument extends Document {
    guildId: string,
    code: string,
    inviterId: string,
    usedBy: string[],
}

// Create the schema
const UsedInviteSchema: Schema = new Schema({
    guildId: { type: String, required: true, index: true },
    code: { type: String, required: true, index: true },
    inviterId: { type: String, required: true },
    usedBy: { type: [String], default: [] },
});

// Create the model
const UsedInviteModel = mongoose.model<UsedInviteDocument>('usedInvites', UsedInviteSchema);

export default UsedInviteModel;