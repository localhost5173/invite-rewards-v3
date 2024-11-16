import type { Client } from 'discord.js';
import { cs } from '../../utils/console/customConsole';
 
export default function (c: Client<true>) {
    cs.log(`${c.user.username} is ready!`);
};