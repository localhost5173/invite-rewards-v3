import { cs } from "../../console/customConsole.js";
import AutoRolesModel from "../models/autoRoles.js"; // Adjust the path as necessary
export class AutoRoles {
    // Add a role to the specified guild
    static async addRole(guildId, roleId) {
        await AutoRolesModel.updateOne({ guildId }, { $addToSet: { roleIds: roleId } }, // Prevents duplicates
        { upsert: true } // Create document if it doesn't exist
        );
        cs.dev(`Role ${roleId} added to auto roles for guild ${guildId}`);
    }
    // Remove a role from the specified guild
    static async removeRole(guildId, roleId) {
        await AutoRolesModel.updateOne({ guildId }, { $pull: { roleIds: roleId } } // Removes roleId from the array
        );
        cs.dev(`Role ${roleId} removed from auto roles for guild ${guildId}`);
    }
    // Get all roles for the specified guild
    static async getRoles(guildId) {
        const autoRoles = await AutoRolesModel.findOne({ guildId });
        if (!autoRoles) {
            cs.dev(`No auto roles found for guild ${guildId}`);
            return []; // Return an empty array if no roles are found
        }
        return autoRoles.roleIds; // Return the array of role IDs
    }
}
