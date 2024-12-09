import UsageModel, { UsageCommands, UsageEvents } from "../models/usageModel";

export class usage {
    static async incrementUses(guildId: string, feature: UsageCommands | UsageEvents) {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        await UsageModel.updateOne(
            { guildId, feature, month, year },
            { $inc: { count: 1 } },
            { upsert: true }
        );
    }
}