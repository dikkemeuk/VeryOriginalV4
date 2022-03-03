import { Listener, SapphireClient } from "@sapphire/framework";

export class ReadyListener extends Listener<"ready"> {

    public async run(client: SapphireClient) {
        client.manager.init(client.user!.id);
        console.log(`${client.user?.tag} is ready!`);
    }
}