import { Command } from "@sapphire/framework";
import type { Message } from "discord.js";

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "ping",
      aliases: ["pong"],
      description: "ping pong",
    });
  }

  public async messageRun(message: Message) {
    const first = await message.channel.send("Ping?");

    const diff = first.createdAt.getTime() - message.createdAt.getTime();

    return await first.edit(
      `Pong! Latency is ${diff}ms. API Latency is ${Math.round(
        this.container.client.ws.ping
      )}ms`
    );
  }
}
