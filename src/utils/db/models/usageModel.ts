import mongoose, { Schema, Document } from 'mongoose';

// Define UsageEvents enum
export enum UsageEvents {
    ReactionRolesAssigned = "reactionRolesAssigned",
    ReactionRolesRemoved = "reactionRolesRemoved",
    AutoRolesAssigned = "autoRolesAssigned",
    WelcomerWelcomeDmMessage = "welcomerWelcomeDmMessage",
    WelcomerWelcomeDmEmbed = "welcomerWelcomeDmEmbed",
    WelcomerWelcomeServerMessage = "welcomerWelcomeServerMessage",
    WelcomerWelcomeServerEmbed = "welcomerWelcomeServerEmbed",
    WelcomerFarewellDmMessage = "welcomerFarewellDmMessage",
    WelcomerFarewellDmEmbed = "welcomerFarewellDmEmbed",
    WelcomerFarewellServerMessage = "welcomerFarewellServerMessage",
    WelcomerFarewellServerEmbed = "welcomerFarewellServerEmbed",
    VerificationCompletedSimple = "verificationCompletedSimple",
    VerificationCompletedQuestion = "verificationCompletedQuestion",
    VerificationCompletedPin = "verificationCompletedPin",
    GiveawayEntry = "giveawayEntry",
    GiveawayLeave = "giveawayLeave",
    InvitesTracked = "invitesTracked",
}

// Define UsageCommands enum
export enum UsageCommands {
    AutoRoleAdd = "autoRoleAdd",
    AutoRoleRemove = "autoRoleRemove",
    AutoRolesView = "autoRolesView",
    GiveawayCreate = "giveawayCreate",
    GiveawayDelete = "giveawayDelete",
    GiveawayEnd = "giveawayEnd",
    GiveawayList = "giveawayList",
    GiveawayReroll = "giveawayReroll",
    BonusInvitesAdd = "bonusInvitesAdd",
    BonusInvitesRemove = "bonusInvitesRemove",
    InviteHistory = "inviteHistory",
    InvitedListView = "invitedListView",
    InviterInfo = "inviterInfo",
    InviteCountView = "inviteCountView",
    WhoUsed = "whoUsed",
    LanguageSet = "languageSet",
    LanguageView = "languageView",
    LeaderboardViewAllTime = "leaderboardViewAllTime",
    LeaderboardViewMonthly = "leaderboardViewMonthly",
    LeaderboardViewWeekly = "leaderboardViewWeekly",
    LeaderboardViewDaily = "leaderboardViewDaily",
    LeaderboardSmartCreateAllTime = "leaderboardSmartViewAllTime",
    LeaderboardSmartCreateMonthly = "leaderboardSmartViewMonthly",
    LeaderboardSmartCreateWeekly = "leaderboardSmartViewWeekly",
    LeaderboardSmartCreateDaily = "leaderboardSmartViewDaily",
    LeaderboardSmartDeleteAll = "leaderboardSmartDeleteAll",
    ReactionRolesSetupButton = "reactionRolesSetupButton",
    RewardAddRole = "rewardAddRole",
    RewardAddMessage = "rewardAddMessage",
    RewardAddMessageStore = "rewardAddMessageStore",
    RewardRemoveRole = "rewardRemoveRole",
    RewardRemoveMessage = "rewardRemoveMessage",
    RewardRemoveMessageStore = "rewardRemoveMessageStore",
    RewardStoreRefill = "rewardStoreRefill",
    RewardsView = "rewardsView",
    VerificationSetupSimple = "verificationSetupSimple",
    VerificationSetupQuestion = "verificationSetupQuestion",
    VerificationSetupPin = "verificationSetupPin",
    VerificationDisable = "verificationDisable",
    WelcomerSetWelcomeServerMessage = "welcomerSetWelcomeServerMessage",
    WelcomerSetWelcomeServerEmbed = "welcomerSetWelcomeServerEmbed",
    WelcomerSetWelcomeDmMessage = "welcomerSetWelcomeDmMessage",
    WelcomerSetWelcomeDmEmbed = "welcomerSetWelcomeDmEmbed",
    WelcomerSetFarewellServerMessage = "welcomerSetFarewellServerMessage",
    WelcomerSetFarewellServerEmbed = "welcomerSetFarewellServerEmbed",
    WelcomerSetFarewellDmMessage = "welcomerSetFarewellDmMessage",
    WelcomerSetFarewellDmEmbed = "welcomerSetFarewellDmEmbed",
    WelcomerSetVanityServerMessage = "welcomerSetVanityServerMessage",
    WelcomerSetVanityServerEmbed = "welcomerSetVanityServerEmbed",
    WelcomerRemoveWelcomeServerMessage = "welcomerRemoveWelcomeServerMessage",
    WelcomerRemoveWelcomeServerEmbed = "welcomerRemoveWelcomeServerEmbed",
    WelcomerRemoveWelcomeDmMessage = "welcomerRemoveWelcomeDmMessage",
    WelcomerRemoveWelcomeDmEmbed = "welcomerRemoveWelcomeDmEmbed",
    WelcomerRemoveFarewellServerMessage = "welcomerRemoveFarewellServerMessage",
    WelcomerRemoveFarewellServerEmbed = "welcomerRemoveFarewellServerEmbed",
    WelcomerRemoveFarewellDmMessage = "welcomerRemoveFarewellDmMessage",
    WelcomerRemoveFarewellDmEmbed = "welcomerRemoveFarewellDmEmbed",
    WelcomerRemoveVanityServerMessage = "welcomerRemoveVanityServerMessage",
    WelcomerRemoveVanityServerEmbed = "welcomerRemoveVanityServerEmbed",
    DataDeleteAll = "dataDeleteAll",
    FeedbackSubmit = "feedbackSubmit",
    HelpCommand = "helpCommand",
    BotInvite = "botInvite",
    PlaceholdersView = "placeholdersView",
    VoteCommand = "voteCommand"
}

// Define the structure of the document
export interface UsageDocument extends Document {
    feature: UsageEvents | UsageCommands; // Use enums for type safety
    guildId: string;
    type: "command" | "event";
    count: number;
    month: number;
    year: number;
}

// Create an array of enum values for validation
const usageFeatureEnumArray = [
    ...Object.values(UsageEvents),
    ...Object.values(UsageCommands)
];

// Create the schema
const UsageSchema: Schema = new Schema({
    feature: { type: String, required: true, index: true, enum: usageFeatureEnumArray },
    guildId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ["command", "event"] },
    count: { type: Number, required: true, default: 0 },
    day: { type: Number, required: true, index: true },
    month: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true }
});

// Create the model
const UsageModel = mongoose.model<UsageDocument>('usage', UsageSchema);

export default UsageModel;