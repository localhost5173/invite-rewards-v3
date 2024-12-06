import VerificationModel from "../models/verification.js";
export class verification {
    static async enableSimple(guildId, roleId) {
        await VerificationModel.findOneAndUpdate({ guildId }, { guildId, type: "simple", roleId, enabled: true }, { upsert: true, new: true });
    }
    static async disable(guildId) {
        await VerificationModel.updateMany({ guildId }, { enabled: false });
    }
    static async enableQuestion(guildId, roleId, question, answer) {
        await VerificationModel.findOneAndUpdate({ guildId }, { guildId, type: "question", roleId, question, answer, enabled: true }, { upsert: true, new: true });
    }
    static async enablePin(guildId, roleId) {
        await VerificationModel.findOneAndUpdate({ guildId }, { guildId, type: "pin", roleId, enabled: true }, { upsert: true, new: true });
    }
    static async isEnabled(guildId) {
        const verification = await VerificationModel.findOne({
            guildId,
            enabled: true,
        });
        return !!verification;
    }
    static async getVerificationRole(guildId) {
        const verification = await VerificationModel.findOne({
            guildId,
            enabled: true,
        });
        return verification?.roleId ?? null;
    }
    static async getVerification(guildId) {
        return VerificationModel.findOne({ guildId, enabled: true });
    }
}
