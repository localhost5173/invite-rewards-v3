import { cs } from "../../console/customConsole";
import InviteEntryModel from "../models/inviteEntries";
import JoinedUserModel from "../models/joinedUsers";
import UsedInviteModel from "../models/usedInvites";
import UserInvitesModel from "../models/userInvites";

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
}

class userInvites {
  static async addReal(guildId: string, inviterId: string): Promise<void> {
    try {
      await UserInvitesModel.findOneAndUpdate(
        {
          guildId: guildId,
          userId: inviterId,
        },
        {
          $inc: { real: 1 }, // Increment the real invites count by 1
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
          $inc: { real: -1 }, // Decrement the real invites count by 1
        }
      );
    } catch (error: unknown) {
      cs.error("Error while decrementing a real invite from a user: " + error);
    }
  }
}

class joinedUsers {
  // Method to add a new join entry
  static async addEntry(
    guildId: string,
    inviterId: string,
    userId: string
  ): Promise<void> {
    // Push a new join entry into the history array
    try {
      await JoinedUserModel.updateOne(
        {
          guildId,
          userId,
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

  // Method to set the leftAt date when a user leaves
  static async setLeftAt(guildId: string, userId: string): Promise<void> {
    // Find the entry where leftAt is still null and update it
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
}

export class invites {
  static inviteEntries = inviteEntries;
  static usedInvites = usedInvites;
  static userInvites = userInvites;
  static joinedUsers = joinedUsers;
}
