import CommandLogModel from "../models/commandLogModel";
import UsageModel, { UsageCommands, UsageEvents } from "../models/usageModel";

export class usage {
    static async incrementUses(guildId: string, feature: UsageCommands | UsageEvents) {
        const day = new Date().getDate();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        await UsageModel.updateOne(
            { guildId, feature, day, month, year },
            { $inc: { count: 1 } },
            { upsert: true }
        );
    }

    static async addCommandLog(guildId: string, command: string, fullCommand: string) {
        const timestamp = new Date();
        const newCommandLog = new CommandLogModel({
            guildId,
            command,
            fullCommand,
            timestamp
        });

        await newCommandLog.save();
    }
}