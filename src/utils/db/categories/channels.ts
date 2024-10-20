import { cs } from "../../console/customConsole";

class info {
  static async get() {
    cs.warn("Getting info channel not implemented yet.");
    return;
  }
}

export class channels {
  static info = info;
}
