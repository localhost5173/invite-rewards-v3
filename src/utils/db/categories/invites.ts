import { cs } from "../../console/customConsole.js";
import InviteEntryModel from "../models/inviteEntries.js";
import JoinedUserModel, { JoinedUserDocument } from "../models/joinedUsers.js";
import UsedInviteModel from "../models/usedInvites.js";
import UserInvitesModel from "../models/userInvites.js";

type InviteEntry = {
  guildId: string;
  code: string;
  expiresAt: Date | null;
  inviterId: string | undefined;
  maxUses: number | null;
  uses: number | null;
};

class inviteEntries {
  static async addEntry(entry: InviteEntry): Promise<void> {
    const newEntry = new InviteEntryModel(entry);
    await newEntry.save();
  }

  static async getEntryByCode(
    guildId: string,
    code: string
  ): Promise<InviteEntry | null> {
    return await InviteEntryModel.findOne({
      guildId: guildId,
      code: code,
    });
  }

  static async getEntriesForGuild(guildId: string): Promise<InviteEntry[]> {
    return await InviteEntryModel.find({
      guildId: guildId,
    });
  }

  static async addUse(guildId: string, code: string): Promise<void> {
    try {
      await InviteEntryModel.updateOne(
        {
          guildId: guildId,
          code: code,
        },
        {
          $inc: { uses: 1 },
        }
      );
    } catch (error: unknown) {
      cs.error("Error while updating invite data with +1 use: " + error);
    }
  }
}

class usedInvites {
  static async addEntry(
    guildId: string,
    inviterId: string | undefined,
    inviteCode: string,
    inviteeId: string
  ): Promise<void> {
    await UsedInviteModel.findOneAndUpdate(
      {
        guildId: guildId,
        code: inviteCode,
        inviterId: inviterId,
      },
      {
        // Push inviteeId to usedBy array, but only if it doesn't already exist
        $addToSet: { usedBy: inviteeId },
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true, // Return the updated document
      }
    );
  }

  static async removeUserFromUsedBy(
    guildId: string,
    userId: string
  ): Promise<void> {
    // Update all documents that match the guildId and have this userId in the usedBy array
    try {
      await UsedInviteModel.updateMany(
        {
          guildId: guildId,
          usedBy: userId,
        },
        {
          $pull: { usedBy: userId }, // Removes the userId from the array
        }
      );
    } catch (error: unknown) {
      cs.error("Error while removing a user from the usedBy array: " + error);
    }
  }

  // Function to get all invited users for a specific inviter in a guild
  static async getInvitedList(
    guildId: string,
    inviterId: string
  ): Promise<string[]> {
    const invites = await UsedInviteModel.find({
      guildId: guildId,
      inviterId: inviterId,
    });

    // Merge all `usedBy` arrays and remove duplicates
    const invitedList = [
      ...new Set(invites.flatMap((invite) => invite.usedBy)),
    ];

    // Return the unique list
    return invitedList;
  }

  static async getUsedByByCode(
    guildId: string,
    code: string
  ): Promise<string[]> {
    const usedInvite = await UsedInviteModel.findOne({
      guildId: guildId,
      code: code,
    });

    if (usedInvite) {
      return usedInvite.usedBy;
    }

    return [];
  }
}

class userInvites {
  static async addFake(guildId: string, inviterId: string): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            fake: 1,
            "timed.monthly.fake": 1,
            "timed.weekly.fake": 1,
            "timed.daily.fake": 1,
          }, // Increment the fake invites count by 1
        },
        {
          upsert: true, // Create the inviter's invite record if it doesn't exist
          new: true,
        }
      );
    } catch (error: unknown) {
      cs.error("Error while adding a fake invite to a user: " + error);
    }
  }

  static async decrementFake(
    guildId: string,
    inviterId: string
  ): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            fake: -1,
            "timed.monthly.fake": -1,
            "timed.weekly.fake": -1,
            "timed.daily.fake": -1,
          }, // Decrement the fake invites count by 1
        }
      );
    } catch (error: unknown) {
      cs.error("Error while decrementing a fake invite from a user: " + error);
    }
  }

  static async addReal(guildId: string, inviterId: string): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            real: 1,
            "timed.monthly.real": 1,
            "timed.weekly.real": 1,
            "timed.daily.real": 1,
          }, // Increment the real invites count by 1
        },
        {
          upsert: true, // Create the inviter's invite record if it doesn't exist
          new: true,
        }
      );
    } catch (error: unknown) {
      cs.error("Error while adding a real invite to a user: " + error);
    }
  }

  static async addUnverified(
    guildId: string,
    inviterId: string
  ): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            unverified: 1,
            "timed.monthly.unverified": 1,
            "timed.weekly.unverified": 1,
            "timed.daily.unverified": 1,
          }, // Increment the unverified invites count by 1
        },
        {
          upsert: true, // Create the inviter's invite record if it doesn't exist
          new: true,
        }
      );
    } catch (error: unknown) {
      cs.error("Error while adding an unverified invite to a user: " + error);
    }
  }

  static async decrementReal(
    guildId: string,
    inviterId: string
  ): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            real: -1,
            "timed.monthly.real": -1,
            "timed.weekly.real": -1,
            "timed.daily.real": -1,
          }, // Decrement the real invites count by 1
        }
      );
    } catch (error: unknown) {
      cs.error("Error while decrementing a real invite from a user: " + error);
    }
  }

  static async getRealAndBonusInvites(
    guildId: string,
    userId: string,
    timedType: "alltime" | "daily" | "weekly" | "monthly"
  ): Promise<number> {
    const userInvites = await UserInvitesModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    let totalInvites = 0;
    switch (timedType) {
      case "alltime":
        totalInvites = (userInvites?.real ?? 0) + (userInvites?.bonus ?? 0);
        break;
      case "daily":
        totalInvites =
          (userInvites?.timed.daily.real ?? 0) +
          (userInvites?.timed.daily.bonus ?? 0);
        break;
      case "weekly":
        totalInvites =
          (userInvites?.timed.weekly.real ?? 0) +
          (userInvites?.timed.weekly.bonus ?? 0);
        break;
      case "monthly":
        totalInvites =
          (userInvites?.timed.monthly.real ?? 0) +
          (userInvites?.timed.monthly.bonus ?? 0);
        break;
    }

    return totalInvites;
  }

  static async getInvites(guildId: string, userId: string) {
    const userInvites = await UserInvitesModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    if (!userInvites) {
      return null;
    }

    return {
      real: userInvites.real,
      bonus: userInvites.bonus,
      fake: userInvites.fake,
      unverified: userInvites.unverified,
    };
  }

  static async addBonus(
    guildId: string,
    inviterId: string,
    count: number
  ): Promise<void> {
    await UserInvitesModel.findOneAndUpdate(
      {
        guildId: guildId,
        userId: inviterId,
      },
      {
        $inc: {
          bonus: count,
          "timed.monthly.bonus": count,
          "timed.weekly.bonus": count,
          "timed.daily.bonus": count,
        },
      },
      {
        upsert: true,
      }
    );
  }

  static async decrementUnverified(
    guildId: string,
    inviterId: string
  ): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: {
            unverified: -1,
            "timed.monthly.unverified": -1,
            "timed.weekly.unverified": -1,
            "timed.daily.unverified": -1,
          }, // Decrement the unverified invites count by 1
        }
      );
    } catch (error: unknown) {
      cs.error(
        "Error while decrementing an unverified invite from a user: " + error
      );
    }
  }

  static async swapUnverifiedForReal(
    guildId: string,
    inviterId: string
  ): Promise<void> {
    await UserInvitesModel.findOneAndUpdate(
      { guildId: guildId, userId: inviterId },
      {
        $inc: {
          unverified: -1,
          real: 1,
          "timed.monthly.unverified": -1,
          "timed.monthly.real": 1,
          "timed.weekly.unverified": -1,
          "timed.weekly.real": 1,
          "timed.daily.unverified": -1,
          "timed.daily.real": 1,
        },
      } // Decrement unverified and increment real invites
    );
  }

  static async resetTimedInvites(
    timedType: "monthly" | "weekly" | "daily"
  ): Promise<void> {
    await UserInvitesModel.updateMany(
      {},
      {
        $set: {
          [`timed.${timedType}.real`]: 0,
          [`timed.${timedType}.fake`]: 0,
          [`timed.${timedType}.bonus`]: 0,
          [`timed.${timedType}.unverified`]: 0,
        },
      }
    );
  }
}

class joinedUsers {
  // Method to add a new join entry
  static async addEntry(
    guildId: string,
    inviterId: string,
    userId: string,
    isVerified?: boolean | undefined,
    isFake?: boolean | undefined
  ): Promise<void> {
    // Push a new join entry into the history array
    try {
      await JoinedUserModel.updateOne(
        {
          guildId: guildId,
          userId: userId,
          inviterId: inviterId,
          isVerified: isVerified,
          isFake: isFake,
        },
        {
          $push: {
            history: {
              joinedAt: new Date(),
              leftAt: null, // User just joined, hasn't left yet
            },
          },
        },
        { upsert: true } // Create the document if it doesn't exist
      );
    } catch (error: unknown) {
      cs.error("error while adding a joined user entry: " + error);
    }
  }

  static async isFakeUser(guildId: string, userId: string): Promise<boolean> {
    const joinedUser = await JoinedUserModel.findOne({
      guildId: guildId,
      userId: userId,
    });
    return joinedUser?.isFake ?? false;
  }

  static async isUserVerified(
    guildId: string,
    userId: string
  ): Promise<boolean> {
    const joinedUser = await JoinedUserModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    if (joinedUser) {
      return joinedUser.isVerified;
    } else {
      return false;
    }
  }

  static async setVerified(
    guildId: string,
    userId: string,
    isVerified: boolean
  ): Promise<void> {
    await JoinedUserModel.updateOne(
      {
        guildId: guildId,
        userId: userId,
      },
      {
        $set: {
          isVerified: isVerified,
        },
      }
    );
  }

  // Method to set the leftAt date when a user leaves
  static async setLeftAt(guildId: string, userId: string): Promise<void> {
    // Find the entry where leftAt is still null and update it
    try {
      await JoinedUserModel.updateOne(
        {
          guildId,
          userId,
          "history.leftAt": null, // Only update the latest join record where the user hasn't left yet
        },
        {
          $set: {
            "history.$.leftAt": new Date(), // Set the leftAt date for that record
          },
        }
      );
    } catch (error: unknown) {
      cs.error("error while setting leftAt for a user: " + error);
    }
  }

  static async getInviterOfUser(
    guildId: string,
    userId: string
  ): Promise<string | null> {
    const joinedUser = await JoinedUserModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    if (joinedUser && joinedUser.inviterId) {
      return joinedUser.inviterId;
    }

    return null;
  }

  static async getHistoryForUser(
    guildId: string,
    userId: string
  ): Promise<{ joinedAt: Date; leftAt: Date | null }[]> {
    const joinedUser = await JoinedUserModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    if (joinedUser) {
      return joinedUser.history;
    }

    return [];
  }

  static async getJoinedUser(
    guildId: string,
    userId: string
  ): Promise<JoinedUserDocument | null> {
    const joinedUser = await JoinedUserModel.findOne({
      guildId: guildId,
      userId: userId,
    });

    if (joinedUser) {
      return joinedUser;
    }

    return null;
  }
}

export class invites {
  static inviteEntries = inviteEntries;
  static usedInvites = usedInvites;
  static userInvites = userInvites;
  static joinedUsers = joinedUsers;
}
