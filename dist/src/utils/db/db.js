import mongoose from "mongoose";
import { AutoRoles } from "./categories/autoRoles";
import { cs } from "../console/customConsole";
import { Languages } from "./categories/languages";
export class db {
    static autoRoles = AutoRoles;
    static languages = Languages;
    static async connectToDatabase() {
        try {
            await mongoose.connect(process.env.MONGODB_URI || "", {});
            cs.info("Connected to MongoDB");
        }
        catch (error) {
            cs.info("Error while connecting to MongoDB: " + error);
        }
    }
}
