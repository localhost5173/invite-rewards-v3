import mongoose, { Schema, Document } from "mongoose";

interface CounterDocument extends Document {
  guildId: string;
  seq: number;
}

const CounterSchema: Schema = new Schema({
  guildId: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const CounterModel = mongoose.model<CounterDocument>("giveawayCounters", CounterSchema);

export default CounterModel;
