// models/AutoRoles.ts

import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the AutoRoles document
interface AdsModel extends Document {
    userId: string;
    adsSent: number;
}

// Create the schema
const AdsSchema: Schema = new Schema({
    userId: { type: String, required: true, unique: true, index: true }, // Unique ID for each user
    adsSent: { type: Number, required: true },
});

// Create the model
const AdsModel = mongoose.model<AdsModel>('Ads', AdsSchema);

export default AdsModel;
