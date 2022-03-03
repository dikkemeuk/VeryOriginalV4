import { Listener } from "@sapphire/framework";

export class ReadyListener extends Listener<"raw"> {

    public async run(packet: any) {
        this.container.client.manager.updateVoiceState(packet)
    }
}