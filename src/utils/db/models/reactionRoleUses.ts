import mongoose, { Schema, Document } from "mongoose";

export interface ReactionRoleUsesDocument extends Document {
  guildId: string;
  roleAssigns: number;
  roleRemoves: number;
}

const ReactionRoleUsesSchema = new Schema({
  guildId: { type: String, required: true, index: true, },
  roleAssigns: { type: Number, default: 0 },
  roleRemoves: { type: Number, default: 0 },
});

const ReactionRolesUsesModel = mongoose.model<ReactionRoleUsesDocument>(
  "reactionRoleUses",
  ReactionRoleUsesSchema
);

export default ReactionRolesUsesModel;