import mongoose from "mongoose";
import { AutoRoles } from "./categories/autoRoles";
import { cs } from "../console/customConsole";
import { Languages } from "./categories/languages";
import { invites } from "./categories/invites";
import { verification } from "./categories/verification";
import { welcomer } from "./categories/welcomer";
import { leaderboards } from "./categories/leaderboards";
import { locks } from "./categories/locks";
import { rewards } from "./categories/rewards";
import { reactionRoles } from "./categories/reactionRoles";

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

  static async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "", {});
      cs.info("Connected to MongoDB");
    } catch (error) {
      cs.info("Error while connecting to MongoDB: " + error);
    }
  }
}
