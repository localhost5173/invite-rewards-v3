import InviteEntryModel from "../models/inviteEntries"

type InviteEntry = {
    guildId: string;
    code: string;
    expiresAt: Date | null;
    inviterId: string | undefined;
    maxUses: number | null;
    uses: number | null;
}

class inviteEntries {
    static async addEntry(entry: InviteEntry): Promise<void> {
        const newEntry = new InviteEntryModel(entry);
        await newEntry.save();
    }

    static async getEntryByCode(guildId: string, code: string): Promise<InviteEntry | null> {
        return await InviteEntryModel.findOne({
            guildId: guildId,
            code: code
        });
    }
}

export class invites {
    static inviteEntries = inviteEntries
}