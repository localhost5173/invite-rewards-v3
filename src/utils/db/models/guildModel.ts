import mongoose, { Schema, Document } from 'mongoose';

export interface GuildDocument extends Document {
    guildId: string;
    memberCount: number;
    joinedAt: Date;
    leftAt: Date | null;
}

// Create the schema
const GuildSchema: Schema = new Schema({
    guildId: { type: String, required: true, index: true },
    guildName: { type: String, required: true },
    memberCount: { type: Number, required: true },
    joinedAt: { type: Date, required: true, default: Date.now },
    leftAt: { type: Date, required: false, default: null },
});

// Create the model
const GuildModel = mongoose.model<GuildDocument>('guilds', GuildSchema);

export default GuildModel;