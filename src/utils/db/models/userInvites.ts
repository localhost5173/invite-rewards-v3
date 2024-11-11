import mongoose, { Schema, Document } from "mongoose";

// Define the structure of the timed invites
export interface TimedInvite {
  real: number;
  fake: number;
  bonus: number;
  unverified: number;
}

export interface TimedInvites {
  daily: TimedInvite;
  weekly: TimedInvite;
  monthly: TimedInvite;
}

// Define the structure of the document
export interface UserInvitesDocument extends Document {
  guildId: string;
  userId: string;
  real: number;
  fake: number;
  bonus: number;
  unverified: number;
  timed: TimedInvites;
}

// Create the schema
const UserInvitesSchema: Schema = new Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  real: { type: Number, default: 0 },
  fake: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  unverified: { type: Number, default: 0 },
  timed: {
    daily: {
      real: { type: Number, default: 0 },
      fake: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      unverified: { type: Number, default: 0 },
    },
    weekly: {
      real: { type: Number, default: 0 },
      fake: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      unverified: { type: Number, default: 0 },
    },
    monthly: {
      real: { type: Number, default: 0 },
      fake: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      unverified: { type: Number, default: 0 },
    },
  },
});

// Create the model
const UserInvitesModel = mongoose.model<UserInvitesDocument>(
  "userInvites",
  UserInvitesSchema
);

export default UserInvitesModel;
