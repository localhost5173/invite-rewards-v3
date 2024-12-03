import mongoose from "mongoose";
import { AutoRoles } from "./categories/autoRoles.js";
import { cs } from "../console/customConsole.js";
import { Languages } from "./categories/languages.js";
import { invites } from "./categories/invites.js";
import { verification } from "./categories/verification.js";
import { welcomer } from "./categories/welcomer.js";
import { leaderboards } from "./categories/leaderboards.js";
import { locks } from "./categories/locks.js";
import { rewards } from "./categories/rewards.js";
import { reactionRoles } from "./categories/reactionRoles.js";
import { resets } from "./categories/resets.js";
import { giveaways } from "./categories/giveaways.js";

export class db {
  static autoRoles = AutoRoles;
  static languages = Languages;
  static invites = invites;
  static verification = verification;
  static welcomer = welcomer;
  static leaderboards = leaderboards;
  static locks = locks;
  static rewards = rewards;
  static reactionRoles = reactionRoles;
  static resets = resets;
  static giveaways = giveaways;

  static async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "", {});
      cs.info("Connected to MongoDB");
    } catch (error) {
      cs.info("Error while connecting to MongoDB: " + error);
    }
  }
}
