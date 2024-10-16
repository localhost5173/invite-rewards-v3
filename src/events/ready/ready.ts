import Eris from "eris";

export default async function (client : Eris.Client) {
    console.log(client.user.username + " is now online!");
}