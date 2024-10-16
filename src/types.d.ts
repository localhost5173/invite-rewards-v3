import { Client, CommandInteraction } from "eris";

type CommandData = {
  name: string;
  description: string;
  type?: CommandOptionType;
  options?: CommandData[];
  required?: boolean | false;
};

type SlashCommandProps = {
  interaction: CommandInteraction;
  client: Client;
};

type CommandOptions = {
  devOnly: boolean;
  userPermissions: Permissions[];
  botPermissions: Permissions[];
  deleted: boolean;
  guildOnly?: boolean;
};

interface CommandObject {
  data: CommandData;
  run: Function;
  options: CommandOptions;
}

declare enum CommandOptionType {
  SubCommand = 1,
  SubCommandGroup = 2,
  String = 3,
  Integer = 4,
  Boolean = 5,
  User = 6,
  Channel = 7,
  Role = 8,
}

declare enum Permissions {
  CreateInstantInvite = "CREATE_INSTANT_INVITE",
  KickMembers = "KICK_MEMBERS",
  BanMembers = "BAN_MEMBERS",
  Administrator = "ADMINISTRATOR",
  ManageChannels = "MANAGE_CHANNELS",
  ManageGuild = "MANAGE_GUILD",
  AddReactions = "ADD_REACTIONS",
  ViewAuditLog = "VIEW_AUDIT_LOG",
  PrioritySpeaker = "PRIORITY_SPEAKER",
  Stream = "STREAM",
  ViewChannel = "VIEW_CHANNEL",
  SendMessages = "SEND_MESSAGES",
  SendTtsMessages = "SEND_TTS_MESSAGES",
  ManageMessages = "MANAGE_MESSAGES",
  EmbedLinks = "EMBED_LINKS",
  AttachFiles = "ATTACH_FILES",
  ReadMessageHistory = "READ_MESSAGE_HISTORY",
  MentionEveryone = "MENTION_EVERYONE",
  UseExternalEmojis = "USE_EXTERNAL_EMOJIS",
  ViewGuildInsights = "VIEW_GUILD_INSIGHTS",
  Connect = "CONNECT",
  Speak = "SPEAK",
  MuteMembers = "MUTE_MEMBERS",
  DeafenMembers = "DEAFEN_MEMBERS",
  MoveMembers = "MOVE_MEMBERS",
  UseVad = "USE_VAD",
  ChangeNickname = "CHANGE_NICKNAME",
  ManageNicknames = "MANAGE_NICKNAMES",
  ManageRoles = "MANAGE_ROLES",
  ManageWebhooks = "MANAGE_WEBHOOKS",
  ManageEmojis = "MANAGE_EMOJIS",
}
