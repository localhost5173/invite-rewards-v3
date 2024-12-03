import { EmbedBuilder } from "discord.js";
import mongoose, { Schema } from "mongoose";
// Create the schema
const WelcomerSchema = new Schema({
    guildId: { type: String, required: true },
    server: {
        welcomeChannelId: { type: String, default: null },
        welcomeMessage: { type: String, default: null },
        welcomeEmbed: { type: Object, default: null },
        welcomeVanityMessage: { type: String, default: null },
        farewellChannelId: { type: String, default: null },
        farewellMessage: { type: String, default: null },
        farewellEmbed: { type: Object, default: null },
        farewellVanityMessage: { type: String, default: null },
    },
    dm: {
        welcomeMessage: { type: String, default: null },
        welcomeEmbed: { type: Object, default: null },
        farewellMessage: { type: String, default: null },
        farewellEmbed: { type: Object, default: null },
    },
    vanity: {
        welcomeMessage: { type: String, default: null },
        welcomeEmbed: { type: Object, default: null },
        farewellMessage: { type: String, default: null },
        farewellEmbed: { type: Object, default: null },
    }
});
// Method to convert APIEmbed back to EmbedBuilder when fetching data
WelcomerSchema.methods.getWelcomeEmbed = function () {
    return this.welcomeEmbed ? new EmbedBuilder(this.welcomeEmbed) : null;
};
WelcomerSchema.methods.getFarewellEmbed = function () {
    return this.farewellEmbed ? new EmbedBuilder(this.farewellEmbed) : null;
};
// Create the model
const WelcomerModel = mongoose.model("welcomer", WelcomerSchema);
export default WelcomerModel;
