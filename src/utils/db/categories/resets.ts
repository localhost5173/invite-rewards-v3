import { ResetsModel } from "../models/resets";

export class resets {
    static async getLastDailyReset() {
        const document = await ResetsModel.findOne({ resetType: "daily" });
        return document?.lastReset;
    }

    static async getLastWeeklyReset() {
        const document = await ResetsModel.findOne({ resetType: "weekly" });
        return document?.lastReset;
    }

    static async getLastMonthlyReset() {
        const document = await ResetsModel.findOne({ resetType: "monthly" });
        return document?.lastReset;
    }

    static async setLastDailyReset() {
        await ResetsModel.findOneAndUpdate({ resetType: "daily" }, { lastReset: Date.now() });
    }

    static async setLastWeeklyReset() {
        await ResetsModel.findOneAndUpdate({ resetType: "weekly" }, { lastReset: Date.now() });
    }

    static async setLastMonthlyReset() {
        await ResetsModel.findOneAndUpdate({ resetType: "monthly" }, { lastReset: Date.now() });
    }
}