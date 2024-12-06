import mongoose, { Schema } from "mongoose";
// Create the schema
const VerificationSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    type: { type: String, enum: ["simple", "question", "pin"], required: true },
    roleId: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    answer: { type: String, required: false },
    question: { type: String, required: false },
});
// Create the model
const VerificationModel = mongoose.model("verification", VerificationSchema);
export default VerificationModel;
