import mongoose, { Schema, Document } from 'mongoose';

export interface CommandLog extends Document {
    guildId: string | null;
    userId?: string;
    command: string;
    fullCommand: string;
    timestamp: Date;
}

// Create the schema
const CommandLogSchema: Schema = new Schema({
    guildId: { type: String, required: false, index: true },
    userId: { type: String, required: false, index: true},
    command: { type: String, required: true },
    fullCommand: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now }
});

// Create the model
const CommandLogModel = mongoose.model<CommandLog>('CommandLog', CommandLogSchema);

export default CommandLogModel;