import mongoose, { Schema, Document } from "mongoose";

// Define the structure of the document
export interface VerificationDocument extends Document {
  guildId: string;
  type: "simple" | "question" | "pin";
  roleId: string;
  enabled?: boolean;
  answer?: string;
  question?: string;
}

// Create the schema
const VerificationSchema: Schema = new Schema({
  guildId: { type: String, required: true },
  type: { type: String, enum: ["simple", "question", "pin"], required: true },
  roleId: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  answer: { type: String, required: false },
  question: { type: String, required: false },
});

// Create the model
const VerificationModel = mongoose.model<VerificationDocument>(
  "verification",
  VerificationSchema
);

export default VerificationModel;
