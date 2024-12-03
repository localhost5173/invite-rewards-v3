import mongoose, { Schema, Document } from "mongoose";

// Define the structure of the Language document
interface LanguageDocument extends Document {
  _id: string; // Store guild ID as _id
  language: string; // Store the language directly as a string
}

// Create the schema
const LanguageSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true, index: true }, // Unique ID for each guild
  language: { type: String, required: true }, // Language field directly at the root level
});

// Create the model
const LanguageModel = mongoose.model<LanguageDocument>(
  "Languages",
  LanguageSchema
);

export default LanguageModel;
