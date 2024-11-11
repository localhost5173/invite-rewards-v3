import { LockModel } from "../models/locks";

export class locks {
  // Function to acquire a lock
  static async acquireLock(lockName: string): Promise<boolean> {
    const lock = await LockModel.findOneAndUpdate(
      { name: lockName, locked: false },
      { $set: { locked: true, timestamp: new Date() } },
      { upsert: true, returnDocument: "after" }
    );

    return lock?.locked === true;
  }

  // Function to release a lock
  static async releaseLock(lockName: string): Promise<void> {
    await LockModel.updateOne({ name: lockName }, { $set: { locked: false } });
  }
}
