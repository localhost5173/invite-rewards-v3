import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the document
export interface InviteEntryDocument extends Document {
    guildId: string;
    code: string;
    expiresAt: Date | null;
    inviterId: string | undefined;
    maxUses: number | null;
    uses: number | null;
}

// Create the schema
const InviteEntrySchema: Schema = new Schema({
    guildId: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    inviterId: { type: String, default: undefined },
    maxUses: { type: Number, default: null },
    uses: { type: Number, default: null },
});

// Create the model
const InviteEntryModel = mongoose.model<InviteEntryDocument>('InviteEntries', InviteEntrySchema);

export default InviteEntryModel;