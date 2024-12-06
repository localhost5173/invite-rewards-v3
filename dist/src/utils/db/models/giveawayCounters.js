import mongoose, { Schema } from "mongoose";
const CounterSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, default: 0 },
});
const CounterModel = mongoose.model("giveawayCounters", CounterSchema);
export default CounterModel;
