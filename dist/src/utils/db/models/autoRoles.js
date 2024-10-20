// models/AutoRoles.ts
import mongoose, { Schema } from 'mongoose';
// Create the schema
const AutoRolesSchema = new Schema({
    guildId: { type: String, required: true, unique: true }, // Unique ID for each guild
    roleIds: { type: [String], required: true }, // Array of role IDs directly
});
// Create the model
const AutoRolesModel = mongoose.model('AutoRoles', AutoRolesSchema);
export default AutoRolesModel;
