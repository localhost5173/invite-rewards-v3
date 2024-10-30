import mongoose from "mongoose";
import { AutoRoles } from "./categories/autoRoles";
import { cs } from "../console/customConsole";
import { Languages } from "./categories/languages";
import { invites } from "./categories/invites";
import { verification } from "./categories/verification";

export class db {
  static autoRoles = AutoRoles;
  static languages = Languages;
  static invites = invites;
  static verification = verification;

  static async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "", {});
      cs.info("Connected to MongoDB");
    } catch (error) {
      cs.info("Error while connecting to MongoDB: " + error);
    }
  }
}
