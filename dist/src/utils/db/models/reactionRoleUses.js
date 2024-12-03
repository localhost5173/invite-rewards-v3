import mongoose, { Schema } from "mongoose";
const ReactionRoleUsesSchema = new Schema({
    guildId: { type: String, required: true },
    roleAssigns: { type: Number, default: 0 },
    roleRemoves: { type: Number, default: 0 },
});
export const ReactionRolesUsesModel = mongoose.model("reactionRoleUses", ReactionRoleUsesSchema);
