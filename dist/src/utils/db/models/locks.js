import mongoose, { Schema } from "mongoose";
const LockSchema = new Schema({
    name: { type: String, unique: true },
    locked: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
});
export const LockModel = mongoose.model("Lock", LockSchema);
