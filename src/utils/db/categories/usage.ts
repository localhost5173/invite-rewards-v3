import { ChatInputCommandInteraction } from "discord.js";
import CommandLogModel from "../models/commandLogModel.js";
import UsageModel, {
  UsageCommands,
  UsageEvents,
} from "../models/usageModel.js";

export class usage {
  static async incrementUses(
    guildId: string,
    feature: UsageCommands | UsageEvents
  ) {
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Determine the type based on the feature
    const type = Object.values(UsageCommands).includes(feature as UsageCommands)
      ? "command"
      : "event";

    await UsageModel.updateOne(
      { guildId, feature, day, month, year },
      { $inc: { count: 1 }, $set: { type } },
      { upsert: true }
    );
  }

  static async logCommand(interaction: ChatInputCommandInteraction) {
    // Construct the full command with options and values
    const fullCommand = constructFullCommand(interaction);

    const newCommandLog = new CommandLogModel({
      guildId: interaction.guildId,
      userId: interaction.user.id,
      command: interaction.commandName,
      fullCommand,
    });

    await newCommandLog.save();
  }

  // Get amount of total commands used by a user
  static getTotalUserCommands(userId: string) {
    return CommandLogModel.countDocuments({ userId });
  }
}

function constructFullCommand(
  interaction: ChatInputCommandInteraction
): string {
  let fullCommand = `/${interaction.commandName}`;

  const options = interaction.options.data;
  if (options.length > 0) {
    fullCommand +=
      " " + options.map((option) => formatOption(option)).join(" ");
  }

  return fullCommand;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatOption(option: any): string {
  let formattedOption = `--${option.name}`;
  if (option.value !== undefined) {
    formattedOption += ` ${option.value}`;
  }

  if (option.options && option.options.length > 0) {
    formattedOption +=
      " " +
      option.options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((subOption: any) => formatOption(subOption))
        .join(" ");
  }

  return formattedOption;
}