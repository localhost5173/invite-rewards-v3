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
import serviceAccount from "../storeBotData/invite-rewards-frontend-firebase-adminsdk-3xdcs-c34d02b3d8.json" assert { type: "json" };
import admin from "firebase-admin";
import { usage } from "./categories/usage.js";
import { guilds } from "./categories/guilds.js";

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
  static firestore: Firestore = null;

  static async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "", {
        dbName: "invite-rewards",
      });
      cs.info("Connected to MongoDB");
    } catch (error) {
      cs.info("Error while connecting to MongoDB: " + error);
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
