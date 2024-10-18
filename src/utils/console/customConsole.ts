import { Console } from "console";
import chalk from "chalk";
import { devMode } from "../../index.js";

class CustomConsole extends Console {
  constructor() {
    super(process.stdout, process.stderr);
  }

  info(message: string) {
    super.info(chalk.blue(message));
  }

  success(message: string) {
    super.info(chalk.green(message));
  }

  warn(message: string) {
    super.warn(chalk.yellow(message));
  }

  error(message: string) {
    super.error(chalk.red(message));
  }

  danger(message: string) {
    super.info(chalk.red.bold(message));
  }

  dev(message: string) {
    if (devMode) {
      super.info(chalk.magenta(message));
    }
  }
}

export const cs = new CustomConsole();
