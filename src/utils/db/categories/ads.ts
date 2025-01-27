import AdsModel from "../models/ads.js";

export class ads {
    static async incrementAdsSent(userId: string) {
        await AdsModel.updateOne(
            { userId },
            { $inc: { adsSent: 1 } },
            { upsert: true }
        );
    }
}