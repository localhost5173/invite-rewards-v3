import mongoose, { Schema, Document } from "mongoose";

export interface LockDocument extends Document {
  name: string;
  locked: boolean;
  timestamp: Date;
}

const LockSchema = new Schema({
  name: { type: String, unique: true },
  locked: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const LockModel = mongoose.model<LockDocument>("Lock", LockSchema);

export default LockModel;