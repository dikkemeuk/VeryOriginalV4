import { SapphireClient } from "@sapphire/framework";
import { TOKEN } from "../config";
import { Manager } from "erela.js";

export class CustomClient extends SapphireClient {
  constructor() {
    super({
      intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
      loadMessageCommandListeners: true,
    });

    this.fetchPrefix = () => {
      return "!";
    };

    this.manager = new Manager({
      nodes: [
        {
          host: "localhost",
          password: "Thisisapassword123",
          port: 5678,
        },
      ],
      send: (id, payload) => {
        const guild = this.guilds.cache.get(id);
        // NOTE: FOR ERIS YOU NEED JSON.stringify() THE PAYLOAD
        if (guild) guild.shard.send(payload);
      },
    });

    this.manager.on("nodeConnect", (node) => {
        console.log(`Connected to node ${node.options.identifier}`);
    });

    this.manager.on("nodeDisconnect", (node) => {
        console.log(`Disconnected from node ${node.options.identifier}`);
    });

    this.manager.on("nodeError", (node, error) => {
        console.log(`Error on node ${node.options.identifier}`, error);
    });
  }

  public async start() {
    await super.login(TOKEN);
  }
}

declare module "discord.js" {
  interface Client {
    manager: Manager;
  }
}
