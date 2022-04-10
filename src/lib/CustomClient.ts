import { container, SapphireClient } from "@sapphire/framework";
import { TOKEN } from "../config";
import { Manager } from "erela.js";
import { GuildMember, MessageEmbed } from "discord.js";
import type { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import { PrismaClient } from "@prisma/client";

export class CustomClient extends SapphireClient {
  constructor() {
    super({
      intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
      loadMessageCommandListeners: true,
      loadDefaultErrorListeners: true
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

    this.manager.on("trackStart", async (player, track) => {

      const embed = new MessageEmbed()
            .setTitle(`Now playing:`)
            .setDescription(`[${track.title}](${track.uri}) ${track.isStream ? " (Stream)" : ""}`)
            .setColor("#0099ff")
            .setThumbnail(track.displayThumbnail("maxresdefault"))
            .setTimestamp()
            .setFooter({ text: `Requested by ${(track.requester as GuildMember).displayName}`, iconURL: (track.requester as GuildMember).displayAvatarURL({dynamic: true}) });

        const channel = await this.channels.fetch(player.textChannel!);
        if(!channel) return;

        if(!channel.isText()) {
            return 
        }
        return channel.send({embeds: [embed]});
    })

    this.manager.on("queueEnd", player => {
      const channel = this.channels.cache.get(player.textChannel!) as GuildTextBasedChannelTypes;
     
      const embed = new MessageEmbed()
      .setTitle(`Queue ended`)
      .setColor("#0099ff")
      .setTimestamp()
      .setDescription(`Unfortunately, the queue has ended.`);
      channel.send({embeds: [embed]});
      player.destroy();
    });

    
  }

  public async start() {
    await super.login(TOKEN);
    this.prisma = new PrismaClient()
    container.prisma = this.prisma;
  }
}

declare module "discord.js" {
  interface Client {
    manager: Manager;
    prisma: PrismaClient;
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}
