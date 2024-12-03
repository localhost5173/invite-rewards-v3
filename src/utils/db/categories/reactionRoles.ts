import { ReactionRolesUsesModel } from "../models/reactionRoleUses.js";
import { ResetsModel } from "../models/resets.js";

export class reactionRoles {
  static async incrementAssigns(guildId: string) {
    await ReactionRolesUsesModel.updateOne(
      { guildId },
      { $inc: { roleAssigns: 1 } },
      { upsert: true }
    );
  }

  static async incrementRemoves(guildId: string) {
    await ReactionRolesUsesModel.updateOne(
      { guildId },
      { $inc: { roleRemoves: 1 } },
      { upsert: true }
    );
  }

  static async resetUses() {
    await ReactionRolesUsesModel.updateMany(
      {},
      { roleAssigns: 0, roleRemoves: 0 }
    );
  }

  static async setLastReset() {
    await ResetsModel.updateOne(
      { resetType: "reactionRoles" },
      { lastReset: Date.now() },
      { upsert: true }
    );
  }

  static async getLastReset() {
    const document = await ResetsModel.findOne({ resetType: "reactionRoles" });
    return document?.lastReset;
  }
}
