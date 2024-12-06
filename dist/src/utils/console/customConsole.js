import { Console } from "console";
import chalk from "chalk";
import { devMode } from "../../index.js";
class CustomConsole extends Console {
    constructor() {
        super(process.stdout, process.stderr);
    }
    info(message) {
        super.info(chalk.blue(message));
    }
    success(message) {
        super.info(chalk.green(message));
    }
    warn(message) {
        super.warn(chalk.yellow(message));
    }
    error(message) {
        super.error(chalk.red(message));
    }
    danger(message) {
        super.info(chalk.red.bold(message));
    }
    dev(message) {
        if (devMode) {
            super.info(chalk.magenta(message));
        }
    }
}
export const cs = new CustomConsole();
