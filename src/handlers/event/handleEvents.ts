import {
    Client,
    Message,
    Guild,
    Member,
    VoiceState,
    Presence,
    TextChannel,
    NewsChannel,
    VoiceChannel,
    CategoryChannel,
    StageChannel,
    Interaction
  } from "eris";
  import getAllFiles from "../../utils/getAllFiles.js";
  import path from "path";
  import { fileURLToPath } from "url";
  
  // Get the equivalent of __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Set of valid event names in Eris
  const validEventNames = new Set([
    "ready",
    "messageCreate",
    "messageDelete",
    "messageUpdate",
    "guildCreate",
    "guildDelete",
    "guildMemberAdd",
    "guildMemberRemove",
    "interactionCreate",
    "guildMemberUpdate",
    "guildBanAdd",
    "guildBanRemove",
    "guildRoleCreate",
    "guildRoleDelete",
    "guildRoleUpdate",
    "channelCreate",
    "channelDelete",
    "channelUpdate",
    "voiceChannelJoin",
    "voiceChannelLeave",
    "voiceChannelSwitch",
    "voiceStateUpdate",
    "presenceUpdate",
    "typingStart",
    "typingStop",
    "error",
    "warn",
    "debug",
  ]);
  
  // Define a type for event handlers
  type EventHandlers = {
    ready: () => void;
    messageCreate: (msg: Message) => void;
    messageDelete: (msg: Message) => void;
    messageUpdate: (msg: Message, oldMsg: Message) => void;
    guildCreate: (guild: Guild) => void;
    guildDelete: (guild: Guild) => void;
    guildMemberAdd: (guild: Guild, member: Member) => void;
    guildMemberRemove: (guild: Guild, member: Member) => void;
    guildMemberUpdate: (guild: Guild, member: Member, oldMember: Member) => void;
    guildBanAdd: (guild: Guild, member: Member) => void;
    guildBanRemove: (guild: Guild, member: Member) => void;
    guildRoleCreate: (guild: Guild, role: any) => void;
    guildRoleDelete: (guild: Guild, role: any) => void;
    guildRoleUpdate: (guild: Guild, role: any, oldRole: any) => void;
    interactionCreate: (interaction: Interaction) => void;
    channelCreate: (
      channel:
        | TextChannel
        | NewsChannel
        | VoiceChannel
        | CategoryChannel
    ) => void;
    channelDelete: (
      channel:
        | TextChannel
        | NewsChannel
        | VoiceChannel
        | CategoryChannel
        | StageChannel
    ) => void;
    channelUpdate: (
      channel:
        | TextChannel
        | NewsChannel
        | VoiceChannel
        | CategoryChannel
        | StageChannel,
      oldChannel:
        | TextChannel
        | NewsChannel
        | VoiceChannel
        | CategoryChannel
        | StageChannel
    ) => void;
    voiceChannelJoin: (member: Member, newChannel: VoiceChannel) => void;
    voiceChannelLeave: (member: Member, oldChannel: VoiceChannel) => void;
    voiceChannelSwitch: (
      member: Member,
      newChannel: VoiceChannel,
      oldChannel: VoiceChannel
    ) => void;
    voiceStateUpdate: (member: Member, oldState: VoiceState) => void;
    presenceUpdate: (member: Member, oldPresence: Presence) => void;
    typingStart: (channel: TextChannel, member: Member) => void;
    typingStop: (channel: TextChannel, member: Member) => void;
    error: (err: Error) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
  };
  
  export default async function (client: Client) {
    const eventFolders = await getAllFiles(
      path.join(__dirname, "../..", "events"),
      true
    );
  
    console.log(eventFolders);
    for (const eventFolder of eventFolders) {
      const eventFiles = await getAllFiles(eventFolder, false);
      eventFiles.sort((a, b) => (a > b ? 1 : -1));
      const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
  
      if (eventName && validEventNames.has(eventName)) {
        client.on(eventName as keyof EventHandlers, async (arg: any) => {
          for (const eventFile of eventFiles) {
            const eventModule = await import(eventFile);
            const eventFunction = eventModule.default;
  
            if (typeof eventFunction === "function") {
              await eventFunction(client, arg);
            } else {
              console.error(`Default export in ${eventFile} is not a function.`);
            }
          }
        });
      } else {
        console.log(`${eventName} is not a valid event name.`);
      }
    }
  }