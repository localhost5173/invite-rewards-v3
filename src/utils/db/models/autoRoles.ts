// models/AutoRoles.ts

import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the AutoRoles document
interface AutoRolesDocument extends Document {
  guildId: string; // Store guild ID as a string
  roleIds: string[]; // Array of role IDs directly at the root level
}

// Create the schema
const AutoRolesSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true, index: true },// Unique ID for each guild
  roleIds: { type: [String], required: true }, // Array of role IDs directly
});

// Create the model
const AutoRolesModel = mongoose.model<AutoRolesDocument>('AutoRoles', AutoRolesSchema);

export default AutoRolesModel;
