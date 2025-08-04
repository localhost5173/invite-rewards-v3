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
import AutoRolesModel from "./models/autoRoles.js";
import GiveawayModel from "./models/giveaway.js";
import CounterModel from "./models/giveawayCounters.js";
import InviteEntryModel from "./models/inviteEntries.js";
import JoinedUserModel from "./models/joinedUsers.js";
import LanguageModel from "./models/languages.js";
import RewardModel from "./models/rewards.js";
import SmartLeaderboardModel from "./models/smartLeaderboardModel.js";
import UsedInviteModel from "./models/usedInvites.js";
import UserInvitesModel from "./models/userInvites.js";
import VerificationModel from "./models/verification.js";
import WelcomerModel from "./models/welcomer.js";
import serviceAccount from "../storeBotData/invite-rewards-frontend-firebase-adminsdk-3xdcs-c34d02b3d8.json" with { type: "json" };
import admin from "firebase-admin";
import { usage } from "./categories/usage.js";
import { guilds } from "./categories/guilds.js";
import { ads } from "./categories/ads.js";

// Configure Mongoose globally
mongoose.set('bufferCommands', false);

type Firestore = admin.firestore.Firestore | null;

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
  static usage = usage;
  static guilds = guilds;
  static ads = ads;
  static firestore: Firestore = null;

  static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  static async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    while (!this.isConnected() && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return this.isConnected();
  }

  static async connectToDatabase(): Promise<void> {
    const uri = process.env.MONGODB_URI || "";
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    let attempt = 0;
    const maxAttempts = 10;
    
    while (attempt < maxAttempts) {
      attempt++;
      try {
        await mongoose.connect(uri, { 
          dbName: "invite-rewards",
          serverSelectionTimeoutMS: 10000, // 10 seconds
          socketTimeoutMS: 45000, // 45 seconds
          bufferCommands: false, // Disable mongoose buffering
          maxPoolSize: 10, // Maintain up to 10 socket connections
          minPoolSize: 5, // Maintain a minimum of 5 socket connections
          maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
          waitQueueTimeoutMS: 10000, // Wait up to 10 seconds for a connection to be available
        });
        cs.info("Connected to MongoDB");
        
        // Test the connection
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping();
          cs.success("MongoDB connection verified");
        }
        break;
      } catch (error) {
        cs.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error}`);
        if (attempt >= maxAttempts) {
          throw new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
        }
        // wait 3 seconds before retrying
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }

  static async initializeFirestore(): Promise<void> {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  
    this.firestore = admin.firestore();
  }

  static async deleteAllData(guildId: string): Promise<void> {
    await AutoRolesModel.deleteMany({ guildId });
    await GiveawayModel.deleteMany({ guildId });
    await CounterModel.deleteMany({ guildId });
    await InviteEntryModel.deleteMany({ guildId });
    await JoinedUserModel.deleteMany({ guildId });
    await LanguageModel.deleteMany({ guildId });
    await RewardModel.deleteMany({ guildId });
    await SmartLeaderboardModel.deleteMany({ guildId });
    await UsedInviteModel.deleteMany({ guildId });
    await UserInvitesModel.deleteMany({ guildId });
    await VerificationModel.deleteMany({ guildId });
    await WelcomerModel.deleteMany({ guildId });
  }
}
