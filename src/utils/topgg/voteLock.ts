import "dotenv/config";
import botconfig from "../../../botconfig.json" assert { type: "json" };

export async function hasVoted(userId: string): Promise<boolean> {
    const token = process.env.TOPGG_TOKEN;
    if (!token) throw new Error('TOPGG_TOKEN is not defined');

    const response = await fetch(`https://top.gg/api/bots/${botconfig.topBotId}/check?userId=${userId}`, {
        headers: {
            Authorization: token
        }
    });

    if (!response.ok) throw new Error('Failed to fetch voting data from Top.gg');

    const data = await response.json();

    
    return data.voted;
}