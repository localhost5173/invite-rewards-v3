import { add, remove } from "./invites/bonus.js";

class bonus {
    static add = add;
    static remove = remove;
}

export class invites {
    static bonus = bonus;
}