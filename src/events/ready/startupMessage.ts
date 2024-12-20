import type { Client } from 'discord.js';
import { cs } from '../../utils/console/customConsole.js';
 
export default function (c: Client<true>) {
    const shardGuilds = c.guilds.cache.map(g => g.name).join(', ');
    cs.log(`Shard launched with ${c.guilds.cache.size} guilds: ${shardGuilds}`);
};