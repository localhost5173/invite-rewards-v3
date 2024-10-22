import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the document
export interface JoinedUserDocument extends Document {
    guildId: string,
    inviterId: string,
    inviteeId: string,
    joinedAt: Date | null,
    leftAt: Date | null,
}

// Create the schema
const JoinedUserSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    inviterId: { type: String, required: true },
    inviteeId: { type: String, required: true },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
});

// Create the model
const JoinedUserModel = mongoose.model<JoinedUserDocument>('joinedUsers', JoinedUserSchema);

export default JoinedUserModel;