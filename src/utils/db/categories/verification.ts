import VerificationModel from "../models/verification";

export class verification {
  static async enableSimple(guildId: string, roleId: string): Promise<void> {
    await VerificationModel.findOneAndUpdate(
      { guildId },
      { guildId, type: "simple", roleId, enabled: true },
      { upsert: true, new: true }
    );
  }

  static async disable(guildId: string): Promise<void> {
    await VerificationModel.updateMany({ guildId }, { enabled: false });
  }

  static async enableQuestion(
    guildId: string,
    roleId: string,
    question: string,
    answer: string
  ): Promise<void> {
    await VerificationModel.findOneAndUpdate(
      { guildId },
      { guildId, type: "question", roleId, question, answer, enabled: true },
      { upsert: true, new: true }
    );
  }

  static async enablePin(guildId: string, roleId: string): Promise<void> {
    await VerificationModel.findOneAndUpdate(
      { guildId },
      { guildId, type: "pin", roleId, enabled: true },
      { upsert: true, new: true }
    );
  }

  static async isEnabled(guildId: string): Promise<boolean> {
    const verification = await VerificationModel.findOne({
      guildId,
      enabled: true,
    });
    return !!verification;
  }

  static async getVerificationRole(guildId: string): Promise<string | null> {
    const verification = await VerificationModel.findOne({
      guildId,
      enabled: true,
    });
    return verification?.roleId ?? null;
  }

  static async getVerification(guildId: string) {
    return VerificationModel.findOne({ guildId, enabled: true });
  }
}
