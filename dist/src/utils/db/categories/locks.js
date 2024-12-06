import { LockModel } from "../models/locks.js";
export class locks {
    // Function to acquire a lock
    static async acquireLock(lockName) {
        const lock = await LockModel.findOneAndUpdate({ name: lockName, locked: false }, { $set: { locked: true, timestamp: new Date() } }, { upsert: true, returnDocument: "after" });
        return lock?.locked === true;
    }
    // Function to release a lock
    static async releaseLock(lockName) {
        await LockModel.updateOne({ name: lockName }, { $set: { locked: false } });
    }
}
