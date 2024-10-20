import mongoose, { Schema } from "mongoose";
// Create the schema
const LanguageSchema = new Schema({
    guildId: { type: String, required: true, unique: true }, // Unique ID for each guild
    language: { type: String, required: true }, // Language field directly at the root level
});
// Create the model
const LanguageModel = mongoose.model("Languages", LanguageSchema);
export default LanguageModel;
